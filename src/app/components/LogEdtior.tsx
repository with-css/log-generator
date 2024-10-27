// components/LogEditor.tsx
import React, { ChangeEvent, useMemo } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Typography,
  Collapse,
  CollapseProps,
  Form,
  Switch,
  Popconfirm,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import Configuration from "./Configuration";
import { BoxCustom, Config, Custom, LogCustom } from "../types";
import Customizer from "./Customizer";
import QuickSettings from "./QuickSettings";
import { createBookmarklet } from "../utils/bookmarkelter";
import { compressData } from "../utils/storage";

const { TextArea } = Input;
const { Title } = Typography;

interface LogEditorProps {
  inputText: string;
  outputText: string;
  config: Config;
  logCustom: LogCustom;
  overwriteStyle?: () => void;
  handleLogCustomChange: (newCustom: LogCustom) => void;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onConfigChange: (key: keyof Config, value: string | boolean) => void;
  onConvertText: () => void;
  onCopyToClipboard: (text: string) => void;
}

const LogEditor: React.FC<LogEditorProps> = ({
  inputText,
  outputText,
  config,
  logCustom,
  overwriteStyle,
  handleLogCustomChange,
  onInputChange,
  onConfigChange,
  onConvertText,
  onCopyToClipboard,
}) => {
  const selected: Custom = useMemo(() => {
    return config.selectedMode === "bot"
      ? logCustom.character
      : logCustom.persona;
  }, [config, logCustom]);

  const setCustomWithQuickSettings = (box: BoxCustom) => {
    const newBox = Object.assign({}, box);
    if (config.selectedMode === "bot") {
      handleLogCustomChange({
        ...logCustom,
        character: {
          ...logCustom.character,
          box: newBox,
        },
      });
    } else if (config.selectedMode === "persona") {
      handleLogCustomChange({
        ...logCustom,
        persona: {
          ...logCustom.persona,
          box: newBox,
        },
      });
    }
  };
  const items: CollapseProps["items"] = [
    {
      key: "0",
      label: "빠른 설정",
      children: (
        <>
          <Row>
            <Col span={24}>
              <QuickSettings
                customHTML={selected.box.customHTML}
                customColors={selected.box.customColors}
                customTexts={selected.box.customTexts}
                customImages={selected.box.customImages}
                onCustomColorsChange={(newColors) =>
                  setCustomWithQuickSettings({
                    ...selected.box,
                    customColors: newColors,
                  })
                }
                onCustomTextsChange={(newTexts) =>
                  setCustomWithQuickSettings({
                    ...selected.box,
                    customTexts: newTexts,
                  })
                }
                onCustomImagesChange={(newImages) =>
                  setCustomWithQuickSettings({
                    ...selected.box,
                    customImages: newImages,
                  })
                }
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "1",
      label: "디자인 수정",
      children: (
        <>
          <Row>
            <Col span={24}>
              <Form>
                <Form.Item label="페르소나에 캐릭터와 같은 디자인 사용">
                  <Switch
                    onChange={(checked) => {
                      if (checked) {
                        handleLogCustomChange({
                          ...logCustom,
                          persona: JSON.parse(
                            JSON.stringify(logCustom.character)
                          ),
                          personaUseCharacterCustom: checked,
                        });
                      } else {
                        handleLogCustomChange({
                          ...logCustom,
                          personaUseCharacterCustom: checked,
                        });
                      }
                    }}
                    checked={logCustom.personaUseCharacterCustom}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={!logCustom.personaUseCharacterCustom ? 12 : 24}>
              <Customizer
                title="캐릭터"
                custom={logCustom.character}
                setCustom={(newCharacterCustom) => {
                  handleLogCustomChange({
                    ...logCustom,
                    character: newCharacterCustom,
                  });
                }}
              ></Customizer>
            </Col>

            {!logCustom.personaUseCharacterCustom && (
              <>
                <Col span={12}>
                  <Customizer
                    title="페르소나"
                    custom={logCustom.persona}
                    setCustom={(newPersonaCustom) => {
                      handleLogCustomChange({
                        ...logCustom,
                        persona: newPersonaCustom,
                      });
                    }}
                  ></Customizer>
                </Col>
              </>
            )}
          </Row>
        </>
      ),
    },
  ];

  return (
    <>
      {/* 입력/출력 패널 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={4}>텍스트 입력</Title>
          <TextArea
            value={inputText}
            onChange={onInputChange}
            placeholder="여기에 텍스트를 입력하세요..."
            style={{ height: "400px", marginBottom: "16px" }}
          />
        </Col>

        <Col xs={24} md={12}>
          <Title level={4}>변환된 HTML</Title>
          <TextArea
            value={outputText}
            readOnly
            style={{ height: "400px", fontFamily: "Consolas" }}
          />
        </Col>
      </Row>

      {config.preview && (
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Title level={4}>변환 결과 렌더링</Title>
            <div dangerouslySetInnerHTML={{ __html: outputText }} />
          </Col>
        </Row>
      )}

      {/* 전처리 옵션 */}
      <Row style={{ marginBottom: "24px" }} justify="center">
        <Col span={24}>
          <Configuration
            preview={config.preview}
            removeAsterisk={config.removeAsterisk}
            botName={config.botName}
            personaName={config.personaName}
            selectedMode={config.selectedMode}
            changeMode={config.changeMode}
            onConfigChange={onConfigChange}
          />
        </Col>
      </Row>

      {/* 버튼 패널 */}
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: "24px" }}>
        <Col>
          <Button type="primary" onClick={onConvertText} size="large">
            HTML 변환
          </Button>
        </Col>
        <Col>
          <Button
            icon={<CopyOutlined />}
            onClick={() => onCopyToClipboard(outputText)}
            size="large"
          >
            HTML 복사
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: "24px" }}>
        {overwriteStyle && (
          <Col>
            <Popconfirm
              title="스타일 덮어쓰기"
              description="기존 데이터가 현재 스타일로 덮어쓰기 됩니다. 진행하시겠습니까?"
              onConfirm={overwriteStyle}
              okText="예"
              cancelText="아니오"
            >
              <Button>스타일 저장</Button>
            </Popconfirm>
          </Col>
        )}
        <Col>
          <Button
            onClick={() =>
              onCopyToClipboard(createBookmarklet(logCustom, config))
            }
          >
            북마클릿 복사
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              onCopyToClipboard(
                window.location.host +
                  window.location.pathname +
                  "?style=" +
                  encodeURIComponent(compressData({ logCustom: logCustom }))
              );
            }}
          >
            스타일 공유 링크 복사
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} justify="center" style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Collapse items={items} defaultActiveKey={["0"]} />
        </Col>
      </Row>
    </>
  );
};

export default LogEditor;
