// BoxCustomizer.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  InputNumber,
  Slider,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Input,
} from "antd";
import { ChromePicker } from "react-color";
import Editor from "@monaco-editor/react";
import { BoxCustom, Config } from "../types";
import QuickSettings from "./QuickSettings";

const { Title } = Typography;

interface BoxCustomizerProps {
  boxCustom: BoxCustom;
  setBoxCustom: (newBoxCustom: BoxCustom) => void;
  images?: [string, string][];
  setImages?: (newImages: [string, string][]) => void;
  config: Config;
}

const BoxCustomizer: React.FC<BoxCustomizerProps> = ({
  boxCustom,
  setBoxCustom,
  config,
  images = [],
  setImages = () => {},
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);

  const {
    isCustomMode,
    customHTML,
    backgroundColor,
    borderRadius,
    shadow,
    customPTag,
    customImages,
    customColors,
    customTexts,
    customImageTag,
  } = boxCustom;
  // CSS Custom 모드가 켜질 때 현재 스타일을 기반으로 초기 CSS 생성
  useEffect(() => {
    if (isCustomMode && !customHTML) {
      const initialCSS = `<div style="max-width: 800px;
margin: 0 auto;
padding: 2rem;
border-radius: ${borderRadius}px;
box-shadow: ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px {{color::박스 그림자 색깔}};
background-color: {{color::박스 배경 색깔}};
">
  <span style="font-size: 1.25rem;
  line-height: 1.75rem;
  color: {{color::이름 색깔}};">
    {{name}}
  </span>
  {{content}}
</div>`;
      setBoxCustom({
        ...boxCustom,
        customHTML: initialCSS,
      });
    }

    if (isCustomMode && !customPTag) {
      setBoxCustom({
        ...boxCustom,
        customPTag: '<p style="margin:1.2rem 0;">{{line}}</p>',
      });
    }
  }, [isCustomMode]);

  useEffect(() => {
    const length = [...customHTML.matchAll(/\{\{color(?:::(.*?))?\}\}/g)]
      .length;

    for (let i = 0; i < length; i++) {
      if (!customColors[i]) customColors[i] = "#ffffff";
    }
  }, [customHTML]);

  const colorPickerStyle: React.CSSProperties = {
    width: "100%",
    height: "32px",
    borderRadius: "4px",
    cursor: "pointer",
    border: "1px solid #d9d9d9",
  };

  const controlLabelStyle: React.CSSProperties = {
    width: "120px",
    display: "inline-block",
    marginRight: "8px",
  };

  return (
    <Card
      title="Box Customizer"
      extra={
        <Space>
          <span>Custom HTML</span>
          <Switch
            checked={isCustomMode}
            onChange={(isCustomMode) =>
              setBoxCustom({ ...boxCustom, isCustomMode })
            }
          />
        </Space>
      }
    >
      <Row gutter={32}>
        {/* Controls */}
        <Col flex="1">
          {isCustomMode ? (
            <>
              <Editor
                height="400px"
                defaultLanguage="html"
                value={customHTML}
                onChange={(value) => {
                  const imageMatches = Array.from(
                    customHTML.matchAll(/\{\{image(?:::(.*?))?\}\}/g)
                  );
                  const textMatches = Array.from(
                    customHTML.matchAll(/\{\{text(?:::(.*?))?\}\}/g)
                  );
                  const colorMatches = Array.from(
                    customHTML.matchAll(/\{\{color(?:::(.*?))?\}\}/g)
                  );
                  setBoxCustom({
                    ...boxCustom,
                    customHTML: value || "",
                    customImages: boxCustom.customImages.slice(
                      0,
                      imageMatches.length
                    ),
                    customTexts: boxCustom.customTexts.slice(
                      0,
                      textMatches.length
                    ),
                    customColors: boxCustom.customColors.slice(
                      0,
                      colorMatches.length
                    ),
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />

              <QuickSettings
                customHTML={customHTML}
                customColors={customColors}
                customTexts={customTexts}
                customImages={customImages}
                onCustomColorsChange={(newColors) =>
                  setBoxCustom({ ...boxCustom, customColors: newColors })
                }
                onCustomTextsChange={(newTexts) =>
                  setBoxCustom({ ...boxCustom, customTexts: newTexts })
                }
                onCustomImagesChange={(newImages) =>
                  setBoxCustom({ ...boxCustom, customImages: newImages })
                }
                images={images}
                setImages={setImages}
                config={config}
              />

              <div style={{ marginBottom: 24 }}>
                <span style={controlLabelStyle}>Custom P Tag</span>
                <Input
                  value={customPTag}
                  status={
                    customPTag.includes("{{line}}") ? undefined : "warning"
                  }
                  onChange={(e) =>
                    setBoxCustom({
                      ...boxCustom,
                      customPTag: e.target.value,
                    })
                  }
                />
                {!customPTag.includes("{{line}}") && (
                  <Typography.Text type="warning">
                    &apos;&#123;&#123;line&#125;&#125;&apos;이 포함되어 있지
                    않습니다. 본문 출력을 위해선
                    &apos;&#123;&#123;line&#125;&#125;&apos;을 포함시켜야
                    합니다.
                  </Typography.Text>
                )}
              </div>

              <div>
                <span style={controlLabelStyle}>Custom Img Tag</span>
                <Input
                  value={customImageTag}
                  status={
                    customImageTag.includes("{{img}}") ? undefined : "warning"
                  }
                  onChange={(e) =>
                    setBoxCustom({
                      ...boxCustom,
                      customImageTag: e.target.value,
                    })
                  }
                />
                {!customImageTag.includes("{{img") && (
                  <Typography.Text type="warning">
                    &apos;&#123;&#123;img&#125;&#125;&apos;이 포함되어 있지
                    않습니다. 본문 출력을 위해선
                    &apos;&#123;&#123;img&#125;&#125;&apos;을 포함시켜야 합니다.
                  </Typography.Text>
                )}
              </div>
            </>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* Background Color */}
              <div>
                <Title level={5}>Background Color</Title>
                <div
                  style={{
                    ...colorPickerStyle,
                    backgroundColor,
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 1,
                      marginTop: 8,
                    }}
                  >
                    <ChromePicker
                      color={backgroundColor}
                      onChange={(color) =>
                        setBoxCustom({
                          ...boxCustom,
                          backgroundColor: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Border Radius */}
              <div>
                <Title level={5}>Border Radius (px)</Title>
                <Slider
                  min={0}
                  max={100}
                  value={borderRadius}
                  onChange={(borderRadius) =>
                    setBoxCustom({ ...boxCustom, borderRadius })
                  }
                />
              </div>

              {/* Box Shadow */}
              <div>
                <Title level={5}>Box Shadow</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <span style={controlLabelStyle}>X Offset:</span>
                    <InputNumber
                      suffix="px"
                      value={shadow.x}
                      onChange={(value) =>
                        setBoxCustom({
                          ...boxCustom,
                          shadow: { ...boxCustom.shadow, x: value || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <span style={controlLabelStyle}>Y Offset:</span>
                    <InputNumber
                      suffix="px"
                      value={shadow.y}
                      onChange={(value) =>
                        setBoxCustom({
                          ...boxCustom,
                          shadow: { ...boxCustom.shadow, y: value || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <span style={controlLabelStyle}>Blur:</span>
                    <InputNumber
                      suffix="px"
                      value={shadow.blur}
                      onChange={(value) =>
                        setBoxCustom({
                          ...boxCustom,
                          shadow: { ...boxCustom.shadow, blur: value || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <span style={controlLabelStyle}>Spread:</span>
                    <InputNumber
                      suffix="px"
                      value={shadow.spread}
                      onChange={(value) =>
                        setBoxCustom({
                          ...boxCustom,
                          shadow: { ...boxCustom.shadow, spread: value || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Title level={5}>Shadow Color</Title>

                    <div
                      style={{
                        ...colorPickerStyle,
                        backgroundColor: boxCustom.shadow.color,
                      }}
                      onClick={() =>
                        setShowShadowColorPicker(!showShadowColorPicker)
                      }
                    />
                    {showShadowColorPicker && (
                      <div
                        style={{
                          position: "absolute",
                          zIndex: 1,
                          marginTop: 8,
                        }}
                      >
                        <ChromePicker
                          color={shadow.color}
                          onChange={(color) =>
                            setBoxCustom({
                              ...boxCustom,
                              shadow: {
                                ...shadow,
                                color: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`,
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </Space>
              </div>
            </Space>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default BoxCustomizer;
