import LZString from "lz-string";
import Cookies from "js-cookie";
import { StorageState, StorageOptions } from "../types";

const STORAGE_KEY = "app_state";

// 기본 스토리지 옵션
const defaultOptions: StorageOptions = {
  expires: 30, // 30일
  path: "/",
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
