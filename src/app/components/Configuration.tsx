import React from "react";
import { Form, Input, Checkbox, Radio, Col, Row, Select } from "antd";
import { Config, IMAGE_UPLOAD_HOST } from "../types";

interface ConfigurationProps {
  config: Config;
  onConfigChange: (key: keyof Config, value: string | boolean) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  config,
  onConfigChange,
}) => {
  const {
    removeAsterisk,
    preview,
    botName,
    personaName,
    selectedMode,
    changeMode,
    imageUpload,
    imageUploadHost,
    beautifyPaste,
  } = config;
  return (
    <Form layout="vertical">
      <Row gutter={[16, 16]} align="middle">
        {/* 애스터리스크 제거 체크박스 */}
        <Col xs={24} sm={6}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={removeAsterisk}
              onChange={(e) =>
                onConfigChange("removeAsterisk", e.target.checked)
              }
            >
              애스터리스크(*) 제거
            </Checkbox>
            <Checkbox
              checked={beautifyPaste}
              onChange={(e) =>
                onConfigChange("beautifyPaste", e.target.checked)
              }
            >
              붙여넣기한 텍스트 자동 수정
            </Checkbox>
            <div>
              <Checkbox
                checked={imageUpload}
                onChange={(e) =>
                  onConfigChange("imageUpload", e.target.checked)
                }
              >
                이미지 자동 업로드
              </Checkbox>
              <Select
                defaultValue={IMAGE_UPLOAD_HOST.IBB}
                style={{ width: 120 }}
                value={imageUploadHost}
                onChange={(value) => onConfigChange("imageUploadHost", value)}
                disabled={!imageUpload}
                options={[{ value: IMAGE_UPLOAD_HOST.ARCA, label: "Arcalive" }]}
              />
            </div>
            <Checkbox
              checked={preview}
              onChange={(e) => onConfigChange("preview", e.target.checked)}
            >
              변환 결과 렌더링
            </Checkbox>
          </Form.Item>
        </Col>

        {/* 봇 이름 입력 */}
        <Col xs={24} sm={6}>
          <Form.Item label="봇 이름" style={{ marginBottom: 0 }}>
            <Input
              value={botName}
              onChange={(e) => onConfigChange("botName", e.target.value)}
              placeholder="봇 이름을 입력하세요"
            />
          </Form.Item>
        </Col>

        {/* 페르소나 이름 입력 */}
        <Col xs={24} sm={6}>
          <Form.Item label="페르소나 이름" style={{ marginBottom: 0 }}>
            <Input
              value={personaName}
              onChange={(e) => onConfigChange("personaName", e.target.value)}
              placeholder="페르소나 이름을 입력하세요"
            />
          </Form.Item>
        </Col>

        {/* 모드 선택 라디오 */}
        <Col xs={24} sm={6}>
          <Form.Item label="모드 선택" style={{ marginBottom: 0 }}>
            <Radio.Group
              value={selectedMode}
              onChange={(e) => onConfigChange("selectedMode", e.target.value)}
            >
              <Radio value="bot">봇</Radio>
              <Radio value="persona">페르소나</Radio>
            </Radio.Group>
            <Checkbox
              value={changeMode}
              onChange={(e) => onConfigChange("changeMode", e.target.checked)}
            >
              변환 후 모드 자동 변경
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default Configuration;
