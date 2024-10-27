// QuickSettings.tsx
import React, { useState } from "react";
import { Row, Col, Input } from "antd";
import { ChromePicker } from "react-color";

interface QuickSettingsProps {
  customHTML: string;
  customColors: string[];
  customTexts: string[];
  customImages: string[];
  onCustomColorsChange: (newColors: string[]) => void;
  onCustomTextsChange: (newTexts: string[]) => void;
  onCustomImagesChange: (newImages: string[]) => void;
}

const QuickSettings: React.FC<QuickSettingsProps> = ({
  customHTML,
  customColors,
  customTexts,
  customImages,
  onCustomColorsChange,
  onCustomTextsChange,
  onCustomImagesChange,
}) => {
  const [showColorPickers, setShowColorPickers] = useState<boolean[]>([]);

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
            <Input
              value={customImages[index]}
              addonBefore={match[1]}
              onChange={(e) => {
                const newImages = [...customImages];
                newImages[index] = e.target.value;
                onCustomImagesChange(newImages);
              }}
            />
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
