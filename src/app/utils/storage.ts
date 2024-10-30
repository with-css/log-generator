import LZString from "lz-string";
import Cookies from "js-cookie";
import {
  StorageState,
  StorageOptions,
  Custom,
  Config,
  IMAGE_UPLOAD_HOST,
} from "../types";

const STORAGE_KEY = "app_state";

// 기본 스토리지 옵션
const defaultOptions: StorageOptions = {
  expires: 30, // 30일
  path: "/",
};

export const createDefaultValue = (): Custom => ({
  box: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    shadow: {
      x: 0,
      y: 0,
      blur: 8,
      spread: 0,
      color: "#ababab",
    },
    customHTML: "",
    isCustomMode: false,
    customPTag: '<p style="margin:1.2rem 0;">{{line}}</p>',
    customImages: [],
    customColors: [],
    customTexts: [],
  },
  text: {
    normal: {
      color: "#000000",
      customCSS: "color: #000000;",
      useCustomCSS: false,
    },
    doubleQuote: {
      color: "#8BE9FD",
      customCSS: "color: #8BE9FD;",
      useCustomCSS: false,
    },
    singleQuote: {
      color: "#50FA7B",
      customCSS: "color: #50FA7B;",
      useCustomCSS: false,
    },
    italic: {
      color: "#A0A0A0",
      customCSS: "color: #A0A0A0;",
      useCustomCSS: false,
    },
    bold: {
      color: "#FFB86C",
      customCSS: "color: #dbccbd;",
      useCustomCSS: false,
    },
    italicBold: {
      color: "#FF79C6",
      customCSS: "color: #FF79C6;",
      useCustomCSS: false,
    },
  },
});

export const createConfigValue = (): Config => {
  return {
    removeAsterisk: true,
    preview: false,
    botName: "",
    personaName: "",
    selectedMode: "bot",
    changeMode: false,
    imageUpload: true,
    imageUploadHost: IMAGE_UPLOAD_HOST.IBB,
  };
};

// 데이터 압축
export const compressData = (data: Partial<StorageState>): string => {
  return LZString.compressToBase64(JSON.stringify(data));
};

// 데이터 압축 해제
export const decompressData = (
  compressed: string
): Partial<StorageState> | null => {
  try {
    const decompressed = LZString.decompressFromBase64(compressed);
    return decompressed ? JSON.parse(decompressed) : null;
  } catch (error) {
    console.error("Failed to decompress data:", error);
    return null;
  }
};

// 상태를 쿠키에 저장
export const saveStateToStorage = (
  state: Partial<StorageState>,
  options: StorageOptions = defaultOptions
): void => {
  try {
    const compressed = compressData(state);
    Cookies.set(STORAGE_KEY, compressed, options);
  } catch (error) {
    console.error("Failed to save state to storage:", error);
  }
};

export const loadCookie = () => {
  const compressed = Cookies.get(STORAGE_KEY);
  return compressed;
};

// 쿠키에서 상태 로드
export const loadStateFromStorage = (): Partial<StorageState> | null => {
  try {
    const compressed = loadCookie();
    if (!compressed) return null;

    return decompressData(compressed);
  } catch (error) {
    console.error("Failed to load state from storage:", error);
    return null;
  }
};

// 특정 상태만 업데이트
export const updateStateInStorage = (
  key: keyof StorageState,
  value: unknown,
  options: StorageOptions = defaultOptions
): void => {
  try {
    const currentState = loadStateFromStorage() || {};
    const newState = {
      ...currentState,
      [key]: value,
    };
    saveStateToStorage(newState, options);
  } catch (error) {
    console.error("Failed to update state in storage:", error);
  }
};

// 쿠키 삭제
export const clearStorage = (): void => {
  try {
    Cookies.remove(STORAGE_KEY, { path: "/" });
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
};

export const initializer = (
  data: Record<string, unknown>,
  template: Record<string, unknown>
): Record<string, unknown> => {
  return Object.entries(data).reduce((initialized, [key, value]) => {
    if (
      value != null &&
      typeof value === "object" &&
      Object.keys(value).length != 0 &&
      !Array.isArray(value)
    ) {
      initialized[key] = initializer(
        value as Record<string, unknown>,
        initialized[key] as Record<string, unknown>
      );
      return initialized;
    } else {
      initialized[key] = value;
      return initialized;
    }
  }, template);
};
