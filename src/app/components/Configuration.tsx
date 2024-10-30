import React from "react";
import { Form, Input, Checkbox, Radio, Col, Row, Select } from "antd";
import { Config } from "../types";

interface ConfigurationProps {
  removeAsterisk: boolean;
  preview: boolean;
  botName: string;
  personaName: string;
  selectedMode: "bot" | "persona";
  changeMode: boolean;
  onConfigChange: (key: keyof Config, value: string | boolean) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  removeAsterisk,
  botName,
  personaName,
  selectedMode,
  preview,
  changeMode,
  onConfigChange,
}) => {
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
              checked={preview}
              onChange={(e) => onConfigChange("preview", e.target.checked)}
            >
              변환 결과 렌더링
            </Checkbox>
            <div>
              <Checkbox
                checked={preview}
                onChange={(e) => onConfigChange("preview", e.target.checked)}
              >
                이미지 자동 업로드
              </Checkbox>
              <Select
                defaultValue="ibb"
                style={{ width: 120 }}
                options={[
                  { value: "ibb", label: "ImgBB" },
                  { value: "arca", label: "Arcalive" },
                ]}
              />
            </div>
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
