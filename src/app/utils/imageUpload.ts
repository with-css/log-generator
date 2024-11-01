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

    // fetch 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROXY_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: true,
      url: data.url,
    };
  } catch (error) {
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
