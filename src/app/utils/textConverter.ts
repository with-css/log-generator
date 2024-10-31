import { Custom, LogCustom, Config, TextCustom } from "../types";
import DOMPurify from "dompurify";

export const removeAsterisk = (text: string): string => {
  return text.replace(/\*+/g, "");
};

export const styleConversationInParagraph = (
  paragraph: string,
  textCustom: TextCustom
): string => {
  const parts: string[] = [];
  let lastEnd = 0;
  const regex = /["“][^"“]*?["”]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(paragraph)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    // 대화문 이전의 나레이션 텍스트 추가
    if (start > lastEnd) {
      const narration = paragraph.substring(lastEnd, start);

      parts.push(
        `<span style="${
          textCustom.normal.useCustomCSS
            ? textCustom["normal"].customCSS
            : "color:" + textCustom["normal"].color
        }">${narration}</span>`
      );
    }

    // 대화문 추가
    parts.push(
      `<span style="${
        textCustom.doubleQuote.useCustomCSS
          ? textCustom["doubleQuote"].customCSS
          : "color:" + textCustom["doubleQuote"].color
      };">${match[0]}</span>`
    );
    lastEnd = end;
  }

  // 마지막 나레이션 텍스트 추가
  if (lastEnd < paragraph.length) {
    const narration = paragraph.substring(lastEnd);
    parts.push(
      `<span style="${
        textCustom.normal.useCustomCSS
          ? textCustom["normal"].customCSS
          : "color:" + textCustom["normal"].color
      }">${narration}</span>`
    );
  }

  return parts.join("");
};

function parseStyledText(input: string, textCustom: TextCustom): string {
  input = input.replace(
    /['‘](.*?)['’]/g,
    `<span style='${
      textCustom.singleQuote.useCustomCSS
        ? textCustom.singleQuote.customCSS
        : "color:" + textCustom.singleQuote.color
    }'>$1</span>`
  );
  // 3개의 별(***)
  input = input.replace(
    /\*\*\*(.*?)\*\*\*/g,
    `<span style='${
      textCustom.italicBold.useCustomCSS
        ? textCustom.italicBold.customCSS
        : "font-style:italic; font-weight:bold; color:" +
          textCustom.italicBold.color
    }'>$1</span>`
  );
  // 2개의 별(**)
  input = input.replace(
    /\*\*(.*?)\*\*/g,
    `<span style='${
      textCustom.bold.useCustomCSS
        ? textCustom.bold.customCSS
        : "font-weight:bold; color:" + textCustom.bold.color
    }'>$1</span>`
  );
  // 1개의 별(*)을 <i>text</i>으로 변환
  input = input.replace(
    /\*(.*?)\*/g,
    `<span style='${
      textCustom.italic.useCustomCSS
        ? textCustom.italic.customCSS
        : "font-style:italic; color:" + textCustom.italic.color
    }'>$1</span>`
  );

  return input;
}

export const processText = (
  text: string,
  config: Config,
  custom: Custom
): string => {
  const paragraphs: string[] = [];
  let currentLines: string[] = [];

  text.split("\n").forEach((line) => {
    const image = line.match(/^\{\{img::(.*?)\}\}$/);
    if (image) {
      paragraphs.push(line);
    } else if (line.trim()) {
      const styledLine = styleConversationInParagraph(line, custom.text);
      currentLines.push(parseStyledText(styledLine, custom.text));
    } else if (currentLines.length > 0) {
      const paragraph = currentLines.join("<br/>");
      paragraphs.push(
        custom.box.isCustomMode
          ? custom.box.customPTag.replaceAll("{{line}}", paragraph)
          : `<p style="margin: 1.25em 0">${paragraph}</p>`
      );
      currentLines = [];
    }
  });

  if (currentLines.length > 0) {
    const paragraph = currentLines.join();
    paragraphs.push(
      custom.box.isCustomMode
        ? custom.box.customPTag.replaceAll("{{line}}", paragraph)
        : `<p style="margin: 1.25em 0">${paragraph}</p>`
    );
  }

  let convertImageText = paragraphs.join("\n");

  convertImageText.matchAll(/\{\{img::(.*?)\}\}/g).forEach((result) => {
    convertImageText = convertImageText.replace(
      result[0],
      custom.box.customImageTag.replace("{{img}}", result[1])
    );
  });

  if (config.removeAsterisk) {
    return removeAsterisk(convertImageText);
  }

  return convertImageText;
};

export const convertToHTML = (
  text: string,
  config: Config,
  logCustom: LogCustom | Custom
): string => {
  const name =
    config.selectedMode === "bot" ? config.botName : config.personaName;
  const custom =
    "character" in logCustom
      ? config.selectedMode === "bot"
        ? logCustom.character
        : logCustom.persona
      : logCustom;
  const convertedText = processText(text.trim(), config, custom);

  if (!custom.box.isCustomMode) {
    return `<div style="max-width: 800px; border-radius: ${custom.box.borderRadius}px; margin: 0 auto; padding: 2rem; box-shadow: ${custom.box.shadow.x}px ${custom.box.shadow.y}px ${custom.box.shadow.blur}px ${custom.box.shadow.spread}px ${custom.box.shadow.color}; background-color: ${custom.box.backgroundColor};"><span style="font-size: 1.25rem; line-height: 1.75rem; color: ${custom.text.normal.color};">${name}</span>${convertedText}</div>`;
  }

  const arr: [RegExp, string[]][] = [
    [/\{\{image(?:::(.*?))?\}\}/g, custom.box.customImages],
    [/\{\{text(?:::(.*?))?\}\}/g, custom.box.customTexts],
    [/\{\{color(?:::(.*?))?\}\}/g, custom.box.customColors],
  ];

  let cbsHTML = custom.box.customHTML;
  for (let i = 0; i < 3; i++) {
    let index = 0;
    // 정규식과 replace 함수 사용
    cbsHTML = cbsHTML.replace(arr[i][0], () => arr[i][1][index++] || "");
  }

  const result = cbsHTML
    .replaceAll("{{content}}", convertedText)
    .replaceAll(
      "{{name}}",
      config.selectedMode === "bot" ? config.botName : config.personaName
    )
    .replaceAll("\n", "");

  return DOMPurify.sanitize(result).trim();
};
