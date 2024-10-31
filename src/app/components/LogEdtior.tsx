// components/LogEditor.tsx
import React, { memo, useMemo, useState } from "react";
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
import ImageUploadTextArea from "./ImageUploadTextArea";
import { convertToHTML } from "../utils/textConverter";

const { TextArea } = Input;
const { Title } = Typography;

const RenderingHTML = memo(function RenderingHTML({
  outputText,
  images,
}: {
  outputText: string;
  images: [string, string][];
}) {
  const output = useMemo(() => {
    let html = outputText;
    images.forEach(([blob, url]) => {
      html = html.replaceAll(
        `src="${url.replace("&", "&amp;")}"`,
        `src="${blob}"`
      );
    });
    return html;
  }, [outputText, images]);

  return <div dangerouslySetInnerHTML={{ __html: output }} />;
});

interface LogEditorProps {
  inputText: string;
  config: Config;
  logCustom: LogCustom;
  overwriteStyle?: () => void;
  handleLogCustomChange: (newCustom: LogCustom) => void;
  onInputChange: (text: string) => void;
  onConfigChange: (key: keyof Config, value: string | boolean) => void;
  onCopyToClipboard: (text: string) => void;
}

const LogEditor: React.FC<LogEditorProps> = ({
  inputText,
  config,
  logCustom,
  overwriteStyle,
  handleLogCustomChange,
  onInputChange,
  onConfigChange,
  onCopyToClipboard,
}) => {
  const selected: Custom = useMemo(() => {
    return config.selectedMode === "bot"
      ? logCustom.character
      : logCustom.persona;
  }, [config, logCustom]);
  const [images, setImages] = useState<[string, string][]>([]);
  const [outputText, setOutputText] = useState<string>("");

  const convertText = (): void => {
    try {
      const result = convertToHTML(inputText, config, logCustom);
      setOutputText(result);
      if (config.changeMode) {
        onConfigChange(
          "selectedMode",
          config.selectedMode === "bot" ? "persona" : "bot"
        );
      }
    } catch (error) {
      console.error("Error during conversion:", error);
    }
  };

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
                images={images}
                setImages={setImages}
                config={config}
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
                images={images}
                setImages={setImages}
                config={config}
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
                    images={images}
                    setImages={setImages}
                    config={config}
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
          <ImageUploadTextArea
            value={inputText}
            onChange={onInputChange}
            placeholder="여기에 텍스트를 입력하세요..."
            rows={6}
            beautifyPaste={config.beautifyPaste}
            images={images}
            setImages={setImages}
            imageUpload={config.imageUpload}
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
            <RenderingHTML
              outputText={outputText}
              images={images}
            ></RenderingHTML>
          </Col>
        </Row>
      )}

      {/* 전처리 옵션 */}
      <Row style={{ marginBottom: "24px" }} justify="center">
        <Col span={24}>
          <Configuration config={config} onConfigChange={onConfigChange} />
        </Col>
      </Row>

      {/* 버튼 패널 */}
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: "24px" }}>
        <Col>
          <Button type="primary" onClick={convertText} size="large">
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
