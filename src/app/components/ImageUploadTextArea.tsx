import React, { useState, useCallback } from "react";
import { GetRef, Input } from "antd";
import { uploadImageToArca } from "../utils/imageUpload";

const { TextArea } = Input;

interface ImageUploadTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type TextAreaRefType = GetRef<typeof TextArea>;

const ImageUploadTextArea: React.FC<ImageUploadTextAreaProps> = ({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  rows = 4,
}) => {
  // 업로드 중인 상태 관리
  const [isUploading, setIsUploading] = useState(false);

  const textarea = React.createRef<TextAreaRefType>();
  // 붙여넣기 이벤트 핸들러
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      try {
        const items = e.clipboardData.items;
        let imageFile: File | null = null;
        const selectionStart =
          textarea.current?.resizableTextArea?.textArea.selectionStart;
        const selectionEnd =
          textarea.current?.resizableTextArea?.textArea.selectionEnd;
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

          setIsUploading(true);

          const result = await uploadImageToArca(imageFile);

          if (result.status && result.url) {
            // 이미지 CBS 문법 생성
            const imageMarkdown = `{{img::${result.url}}}`;

            // 현재 커서 위치에 이미지 마크다운 삽입
            const newValue =
              value.slice(0, selectionStart) +
              imageMarkdown +
              value.slice(selectionEnd);

            onChange(newValue);
          } else {
            setIsUploading(false);
            throw new Error(result.error || "업로드 실패");
          }
        }
        // 클립보드 데이터에서 이미지 파일 찾기
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("text/html") !== -1) {
            item.getAsString(async (s) => {
              e.preventDefault(); // 기본 붙여넣기 동작 방지
              const mimeType = "text/html";
              const domParser = new DOMParser();
              const images: string[] = [];

              const dom = domParser.parseFromString(s, mimeType);

              dom.querySelectorAll("em").forEach((em) => {
                em.innerText = `*${em.innerText}*`;
              });

              dom.querySelectorAll("strong").forEach((strong) => {
                strong.innerText = `**${strong.innerText}**`;
              });

              dom.querySelectorAll("li").forEach((li) => {
                li.innerText = "- " + li.innerText;
              });

              dom.querySelectorAll("br").forEach((br) => {
                br.outerHTML = "<div>\n</div>";
              });

              dom.querySelectorAll("img").forEach((img) => {
                const risuImg = img.src.match(
                  /https:\/\/sv\.risuai\.xyz\/rs\/assets\/[a-f0-9]+\.\w+/
                );

                if (risuImg) {
                  images.push(risuImg[0]);
                  img.outerHTML = `<div>{{img::${risuImg[0]}}}</div>`;
                }
              });

              let text = dom.getElementsByTagName("body")[0].innerText;

              setIsUploading(true);
              for (let i = 0; i < images.length; i++) {
                // 1. 이미지 URL에서 이미지 데이터 가져오기
                const imageResponse = await fetch(images[i]);
                const imageBlob = await imageResponse.blob();

                // 2. 이미지 파일 생성
                const imageFile = new File([imageBlob], "image.png", {
                  type: imageBlob.type,
                });

                const result = await uploadImageToArca(imageFile);
                // const result = { url: "a", status: 200 };
                console.log(images[i]);
                if (result.status && result.url) {
                  text = text.replace(images[i], result.url);
                } else {
                  setIsUploading(false);
                  throw new Error(result.error || "업로드 실패");
                }
              }

              const newValue =
                value.slice(0, selectionStart) +
                text.trim() +
                value.slice(selectionEnd);
              onChange(newValue);
              setIsUploading(false);
            });
            break;
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [value, onChange, textarea]
  );

  return (
    <TextArea
      ref={textarea}
      style={{ height: "400px", marginBottom: "16px" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
      placeholder={placeholder}
      rows={rows}
      disabled={isUploading}
    />
  );
};

export default ImageUploadTextArea;
