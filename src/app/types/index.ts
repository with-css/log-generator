export interface BoxCustom {
  backgroundColor: string;
  borderRadius: number;
  shadow: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  isCustomMode: boolean;
  customHTML: string;
  customPTag: string;
  customImages: string[];
  customColors: string[];
  customTexts: string[];
}

export type TextStyleType =
  | "normal"
  | "italic"
  | "bold"
  | "italicBold"
  | "singleQuote"
  | "doubleQuote";

export enum IMAGE_UPLOAD_HOST {
  IBB = "ibb",
  ARCA = "arca",
}

export interface TextStyle {
  color: string;
  customCSS: string;
  useCustomCSS: boolean;
}

export type TextCustom = {
  [key in TextStyleType]: TextStyle;
};

export interface Custom {
  box: BoxCustom;
  text: TextCustom;
}

export interface LogCustom {
  persona: Custom;
  character: Custom;
  personaUseCharacterCustom: boolean;
}

export interface Config {
  removeAsterisk: boolean;
  preview: boolean;
  botName: string;
  personaName: string;
  selectedMode: "bot" | "persona";
  changeMode: boolean;
  imageUpload: boolean;
  imageUploadHost: IMAGE_UPLOAD_HOST;
}

export interface StorageState {
  logCustom: LogCustom;
  config?: Config;
}

export interface StorageOptions {
  expires?: number; // 쿠키 만료일 (일 단위)
  path?: string; // 쿠키 경로
}
