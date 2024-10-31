// QuickSettings.tsx
import React, { useState } from "react";
import { Row, Col, Input, Upload, Button } from "antd";
import { ChromePicker } from "react-color";
import { UploadOutlined } from "@ant-design/icons";
import { uploadImageToArca } from "../utils/imageUpload";
import { Config } from "../types";

interface QuickSettingsProps {
  config: Config;
  customHTML: string;
  customColors: string[];
  customTexts: string[];
  customImages: string[];
  onCustomColorsChange: (newColors: string[]) => void;
  onCustomTextsChange: (newTexts: string[]) => void;
  onCustomImagesChange: (newImages: string[]) => void;
  images?: [string, string][];
  setImages?: (newImages: [string, string][]) => void;
}

const QuickSettings: React.FC<QuickSettingsProps> = ({
  config,
  customHTML,
  customColors,
  customTexts,
  customImages,
  onCustomColorsChange,
  onCustomTextsChange,
  onCustomImagesChange,
  images = [],
  setImages = () => {},
}) => {
  const [showColorPickers, setShowColorPickers] = useState<boolean[]>([]);
  const [loadingUploads, setLoadingUploads] = useState<boolean[]>([]);

  const handleLoading = (loading: boolean, index: number) => {
    const newLoadings = loadingUploads.slice();

    while (newLoadings.length < index) {
      newLoadings.push(false);
    }

    newLoadings[index] = loading;

    setLoadingUploads(newLoadings);
  };

  const controlLabelStyle: React.CSSProperties = {
    width: "100px",
    display: "inline-block",
    marginRight: "8px",
  };

  const colorPickerStyle: React.CSSProperties = {
    width: "100%",
    height: "32px",
    borderRadius: "4px",
    cursor: "pointer",
    border: "1px solid #d9d9d9",
  };

  // Colors Section
  const renderColorFields = () => {
    const colorMatches = Array.from(
      customHTML.matchAll(/\{\{color(?:::(.*?))?\}\}/g)
    );
    if (!colorMatches.length) return null;

    // const newColors = [...customColors];
    // onCustomColorsChange(newColors.slice(0, colorMatches.length));

    return (
      <Row gutter={[8, 8]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <span style={controlLabelStyle}>Custom Color</span>
        </Col>
        {colorMatches.map((match, index) => (
          <React.Fragment key={`color-${index}`}>
            {match[1] && <Col>{match[1]}</Col>}
            <Col span={24}>
              <div
                style={{
                  ...colorPickerStyle,
                  backgroundColor: customColors[index],
                }}
                onClick={() => {
                  const newSelects = customColors.map(
                    (_, i) => i === index && !showColorPickers[index]
                  );
                  setShowColorPickers(newSelects);
                }}
              />
              {showColorPickers[index] && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    marginTop: 8,
                  }}
                >
                  <ChromePicker
                    color={customColors[index]}
                    onChange={(color) => {
                      const newColors = [...customColors];
                      newColors[
                        index
                      ] = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                      onCustomColorsChange(newColors);
                    }}
                  />
                </div>
              )}
            </Col>
          </React.Fragment>
        ))}
      </Row>
    );
  };

  // Texts Section
  const renderTextFields = () => {
    const textMatches = Array.from(
      customHTML.matchAll(/\{\{text(?:::(.*?))?\}\}/g)
    );
    if (!textMatches.length) return null;

    return (
      <Row gutter={[8, 8]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <span style={controlLabelStyle}>Custom Text</span>
        </Col>
        {textMatches.map((match, index) => (
          <Col span={24} key={`text-${index}`}>
            <Input
              value={customTexts[index]}
              addonBefore={match[1]}
              onChange={(e) => {
                const newTexts = [...customTexts];
                newTexts[index] = e.target.value;
                onCustomTextsChange(newTexts);
              }}
            />
          </Col>
        ))}
      </Row>
    );
  };

  // Images Section
  const renderImageFields = () => {
    const imageMatches = Array.from(
      customHTML.matchAll(/\{\{image(?:::(.*?))?\}\}/g)
    );
    if (!imageMatches.length) return null;

    return (
      <Row gutter={[8, 8]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <span style={controlLabelStyle}>Custom Image</span>
        </Col>
        {imageMatches.map((match, index) => (
          <Col span={24} key={`image-${index}`}>
            <Row gutter={4}>
              <Col span={config.imageUpload ? 20 : 24}>
                <Input
                  value={customImages[index]}
                  addonBefore={match[1]}
                  disabled={loadingUploads[index]}
                  onChange={(e) => {
                    const newImages = [...customImages];
                    newImages[index] = e.target.value;
                    onCustomImagesChange(newImages);
                  }}
                  onPaste={async function (e) {
                    try {
                      handleLoading(true, index);

                      const items = e.clipboardData.items;
                      let imageFile: File | null = null;

                      // 클립보드 데이터에서 이미지 파일 찾기
                      for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.type.indexOf("image") !== -1) {
                          imageFile = item.getAsFile();
                          break;
                        }
                      }

                      // 이미지가 있을 경우 업로드 처리
                      if (imageFile) {
                        e.preventDefault(); // 기본 붙여넣기 동작 방지

                        const result = await uploadImageToArca(imageFile);

                        if (result.status && result.url) {
                          setImages(
                            images
                              .slice()
                              .concat([
                                [URL.createObjectURL(imageFile), result.url],
                              ])
                          );

                          // 현재 커서 위치에 이미지 마크다운 삽입

                          const newImages = [...customImages];
                          newImages[index] = result.url;
                          onCustomImagesChange(newImages);
                          handleLoading(false, index);
                        } else {
                          handleLoading(false, index);
                          throw new Error(result.error || "업로드 실패");
                        }
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                    }
                  }}
                />
              </Col>
              {config.imageUpload && (
                <Col span={4}>
                  <Upload
                    customRequest={async function ({ file, onError }) {
                      try {
                        handleLoading(true, index);
                        // API에 파일 업로드를 수행하는 사용자 정의 함수 호출
                        const result = await uploadImageToArca(file as File);

                        if (!result.url) {
                          throw new Error("Oh no!");
                        }
                        setImages(
                          images.concat([
                            [URL.createObjectURL(file as File), result.url],
                          ])
                        );

                        const newImages = [...customImages];
                        newImages[index] = result.url || "";
                        onCustomImagesChange(newImages);
                        handleLoading(false, index);
                      } catch (e) {
                        console.error(`file upload failed`);
                        onError!(e as Error);
                      }
                    }}
                    accept="image/*"
                    showUploadList={false} // 업로드 진행 상태 표시를 하지 않음
                  >
                    <Button
                      loading={loadingUploads[index]}
                      style={{ width: "100%" }}
                      icon={<UploadOutlined />}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Col>
              )}
            </Row>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <>
      {renderColorFields()}
      {renderTextFields()}
      {renderImageFields()}
    </>
  );
};

export default QuickSettings;
