import { Card, Row, Col } from "antd";
import React from "react";
import BoxCustomizer from "./BoxCustomizer";
import TextStylePicker from "./TextStylePicker";
import { Config, Custom, IMAGE_UPLOAD_HOST } from "../types";
import { convertToHTML } from "../utils/textConverter";

interface CustomizerProps {
  title?: string;
  custom: Custom;
  setCustom: (newCustom: Custom) => void;
  config: Config;
  images?: [string, string][];
  setImages?: (newImages: [string, string][]) => void;
}

const Customizer: React.FC<CustomizerProps> = ({
  title = "캐릭터",
  custom,
  setCustom,
  config,
  images = [],
  setImages = () => {},
}) => {
  // Custom CSS를 적용한 프리뷰 렌더링
  const renderPreview = () => {
    const customHTML = convertToHTML(
      `벌써 내 때 그대에게 "*망각*의 너도 잠", 나 백 추억과 한 쌓인 시인의 기억해주오 지우지 언제나 '망각의 것 생명을 모든 것을 비로소 쉬이 아직' 그대에게 것이다.

흙으로 흙이 없든 약산 노루, 잊지 내일 언제나 바다로 강물과 푸른 듯합니다. "푸른 아침이 내일 척 떨어진다." 생명들 **저녁** 아니 슬퍼하는 오신다면 붉은 가시옵소서. 박명의 이었다.

{{img::https://picsum.photos/seed/picsum/400/300}}

모래 ***진달래꽃*** 프랑시스 하염없이 이름과, 알리라, 것을 즈려 날에, 까닭이요, 놓인 누워 먹이고 하늘에는 겨울이 까닭이요, "푸른 책상을 많은 때 나를 해일에 아름따다 내 합니다."`,
      {
        removeAsterisk: true,
        preview: false,
        botName: "봇 이름",
        personaName: "페르소나 이름",
        selectedMode: title == "캐릭터" ? "bot" : "persona",
        changeMode: false,
        imageUpload: false,
        imageUploadHost: IMAGE_UPLOAD_HOST.IBB,
        beautifyPaste: false,
      },
      custom
    );

    let text = customHTML;

    images.forEach(([blob, url]) => {
      text = text.replaceAll(
        `src="${url.replace("&", "&amp;")}"`,
        `src="${blob}"`
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <Card title={title}>
      <Row style={{ marginBottom: "24px" }}>
        <Col span={24} style={{ maxHeight: 500, overflow: "auto" }}>
          {renderPreview()}
        </Col>
      </Row>
      <Row style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <BoxCustomizer
            boxCustom={custom.box}
            setBoxCustom={(newBoxCustom) =>
              setCustom({ ...custom, box: newBoxCustom })
            }
            images={images}
            setImages={setImages}
            config={config}
          />
        </Col>
      </Row>
      {/* 색상 설정 패널 */}
      <Row style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <TextStylePicker
            textStyles={custom.text}
            setTextStyles={(newTextStyles) => {
              setCustom({ ...custom, text: newTextStyles });
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default Customizer;
