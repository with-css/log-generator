import React from "react";
import { Card, Typography, Button, Space, Tooltip } from "antd";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";

const { Text } = Typography;

const SharedStyle = () => {
  const sampleText = `여기에 긴 공유 텍스트가 들어갑니다. 이 텍스트는 읽기 전용이며 수정할 수 없습니다.
실제 텍스트는 props나 다른 방식으로 주입될 수 있습니다.
여러 줄의 텍스트가 들어갈 수 있으며, 스크롤이 생성됩니다.`;

  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      title="공유된 텍스트"
      extra={
        <Space>
          <Tooltip title="미리보기">
            <Button icon={<EyeOutlined />} type="default">
              미리보기
            </Button>
          </Tooltip>
          <Tooltip title="저장하기">
            <Button icon={<SaveOutlined />} type="primary">
              저장
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
        <Text className="whitespace-pre-wrap">{sampleText}</Text>
      </div>
    </Card>
  );
};

export default SharedStyle;
