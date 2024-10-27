import React, { useState } from "react";
import { Card, Row, Col, Button, Typography, Space, Switch, Input } from "antd";
import { ChromePicker, ColorResult } from "react-color";
import { TextCustom, TextStyle, TextStyleType } from "../types";

const { Text } = Typography;

interface TextStylePickerProps {
  textStyles: TextCustom;
  setTextStyles: (textStyles: TextCustom) => void;
}

export type ColorPickerState = {
  [key in TextStyleType]: boolean;
};

const TextStylePicker: React.FC<TextStylePickerProps> = ({
  textStyles,
  setTextStyles,
}) => {
  const [showPicker, setShowPicker] = useState<ColorPickerState>({
    normal: false,
    italic: false,
    bold: false,
    italicBold: false,
    singleQuote: false,
    doubleQuote: false,
  });

  const handleCustomCSSToggle = (styleId: TextStyleType): void => {
    const newTextStyle = textStyles;
    newTextStyle[styleId].useCustomCSS = !newTextStyle[styleId].useCustomCSS;
    newTextStyle[styleId].customCSS =
      !newTextStyle[styleId].useCustomCSS &&
      newTextStyle[styleId].customCSS == ""
        ? `color: ${newTextStyle[styleId].color}`
        : newTextStyle[styleId].customCSS;

    setTextStyles(newTextStyle);
    // CSS 커스텀 켤 때 컬러픽커 닫기
    if (!showPicker[styleId]) {
      setShowPicker((prev) => ({
        ...prev,
        [styleId]: false,
      }));
    }
  };

  const handleCustomCSSChange = (
    styleId: TextStyleType,
    value: string
  ): void => {
    const newTextStyle = textStyles;
    newTextStyle[styleId].customCSS = value;
    setTextStyles(newTextStyle);
  };

  const handleColorChange = (
    styleId: TextStyleType,
    color: ColorResult
  ): void => {
    const newTextStyle = textStyles;
    newTextStyle[
      styleId
    ].color = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    setTextStyles(newTextStyle);
  };

  const toggleColorPicker = (styleId: TextStyleType): void => {
    setShowPicker((prev) => ({
      ...prev,
      [styleId]: !prev[styleId],
    }));
  };

  const parseCSS = (cssString: string): React.CSSProperties => {
    if (!cssString.trim()) return {};

    return cssString
      .split(";")
      .filter((prop) => prop.trim())
      .reduce<React.CSSProperties>((acc, prop) => {
        const [key, value] = prop.split(":").map((item) => item.trim());
        if (!key || !value) return acc;
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return { ...acc, [camelKey]: value };
      }, {});
  };

  const getAppliedStyle = (
    key: string,
    style: TextStyle
  ): React.CSSProperties => {
    if (style.useCustomCSS) {
      return parseCSS(style.customCSS);
    }

    const baseStyle: React.CSSProperties = {
      color: style.color,
    };

    switch (key) {
      case "italic":
        return { ...baseStyle, fontStyle: "italic" };
      case "bold":
        return { ...baseStyle, fontWeight: "bold" };
      case "italicBold":
        return { ...baseStyle, fontStyle: "italic", fontWeight: "bold" };
      default:
        return baseStyle;
    }
  };

  return (
    <Card title="Text Style Customizer" styles={{ body: { padding: "4px" } }}>
      {Object.entries(textStyles).map(([key, style]) => (
        <div
          key={key}
          className="md:p-8 p-[4px]"
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
          }}
        >
          {/* 첫 번째 줄: 라벨, 컬러픽커, CSS 커스텀 스위치 */}
          <Row
            gutter={[16, 16]}
            align="middle"
            style={{ marginBottom: "12px" }}
          >
            <Col xs={24} sm={8} md={6} lg={4}>
              <Text strong>{key}</Text>
            </Col>

            <Col xs={12} sm={8} md={6} lg={4}>
              {!style.useCustomCSS && (
                <div style={{ position: "relative" }}>
                  <Button
                    style={{
                      backgroundColor: style.color,
                      width: "60px",
                      height: "32px",
                      border: "1px solid #d9d9d9",
                    }}
                    onClick={() => toggleColorPicker(key as keyof TextCustom)}
                  />
                  {showPicker[key as keyof TextCustom] && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 2,
                        marginTop: "8px",
                      }}
                    >
                      <ChromePicker
                        color={style.color}
                        onChange={(color) =>
                          handleColorChange(key as keyof TextCustom, color)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </Col>

            <Col xs={12} sm={8} md={6} lg={4}>
              <Space>
                <Switch
                  checked={style.useCustomCSS}
                  onChange={() =>
                    handleCustomCSSToggle(key as keyof TextCustom)
                  }
                />
                <Text>CSS Custom</Text>
              </Space>
            </Col>
          </Row>

          {/* 두 번째 줄: CSS 입력 필드와 적용 예시 */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              {style.useCustomCSS && (
                <Input
                  value={style.customCSS}
                  onChange={(e) =>
                    handleCustomCSSChange(
                      key as keyof TextCustom,
                      e.target.value
                    )
                  }
                  placeholder="color: #88E9FD; font-size: 12px;"
                />
              )}
            </Col>
            <Col xs={24} lg={12}>
              <div
                style={{
                  padding: "8px",
                  background: "#fafafa",
                  borderRadius: "4px",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text style={getAppliedStyle(key, style)}>{key}</Text>
              </div>
            </Col>
          </Row>
        </div>
      ))}
    </Card>
  );
};

export default TextStylePicker;
