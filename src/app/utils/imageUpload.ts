import { message } from "antd";

const generateRandomString = (length: number) => {
  const characters = "0123456789abcde";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

interface UploadResponse {
  status: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToArca = async (
  file: File
): Promise<UploadResponse> => {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append("upload", file);
    formData.append("token", generateRandomString(16));
    formData.append("saveExif", "false");
    formData.append("saveFilename", "false");
    // fetch 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROXY_URL}/upload`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: true,
      url: data.url, // API 응답에 따라 적절한 필드명으로 수정 필요
    };
  } catch (error) {
    message.error("이미지 업로드에 실패했습니다.");
    console.error("Upload error:", error);

    return {
      status: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
};
