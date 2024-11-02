import { Config, LogCustom } from "../types";
import DOMPurify from "dompurify";

export const createBookmarklet = (
  custom: LogCustom,
  config: Config
): string => {
  const sanitization = Object.assign({}, custom);
  sanitization.character.box.customHTML = DOMPurify.sanitize(
    custom.character.box.customHTML
  );
  sanitization.character.box.customPTag = DOMPurify.sanitize(
    custom.character.box.customHTML
  );
  sanitization.persona.box.customHTML = DOMPurify.sanitize(
    custom.persona.box.customHTML
  );
  sanitization.persona.box.customPTag = DOMPurify.sanitize(
    custom.character.box.customHTML
  );
  // Convert the styling logic to a bookmarklet-compatible string
  const bookmarkletCode = `javascript: (() => {
    const custom = ${JSON.stringify(sanitization)};
    const config = ${JSON.stringify(config)};

    const processText = (text, isCharacter, name) => {
      const paragraphs = [];
      const currentLines = [];
      const selectedCustom = isCharacter ? custom.character : custom.persona;
      text.split("\\n").forEach(line => {
        if (line.trim()) {
          let processedLine = line;
          
          const parts = [];
          let lastEnd = 0;
          const regex = /["“][^"”]*?["”]/g;
          let match;

          while ((match = regex.exec(line)) !== null) {
            const start = match.index;
            const end = regex.lastIndex;

            if (start > lastEnd) {
              const narration = line.substring(lastEnd, start);
              parts.push(
                \`<span style="\${
                  selectedCustom.text.normal.useCustomCSS
                    ? selectedCustom.text.normal.customCSS
                    : "color:" + selectedCustom.text.normal.color
                }">\${narration}</span>\`
              );
            }

            parts.push(
              \`<span style="\${
                selectedCustom.text.doubleQuote.useCustomCSS
                  ? selectedCustom.text.doubleQuote.customCSS
                  : "color:" + selectedCustom.text.doubleQuote.color
              }">\${match[0]}</span>\`
            );
            lastEnd = end;
          }

          if (lastEnd < line.length) {
            const narration = line.substring(lastEnd);
            parts.push(
              \`<span style="\${
                selectedCustom.text.normal.useCustomCSS
                  ? selectedCustom.text.normal.customCSS
                  : "color:" + selectedCustom.text.normal.color
              }">\${narration}</span>\`
            );
          }

          processedLine = parts.join("");

          processedLine = processedLine.replace(
            /[''](.*?)['']/g,
            \`<span style='\${
              selectedCustom.text.singleQuote.useCustomCSS
                ? selectedCustom.text.singleQuote.customCSS
                : "color:" + selectedCustom.text.singleQuote.color
            }'>$1</span>\`
          );

          processedLine = processedLine.replace(
            /\\*\\*\\*(.*?)\\*\\*\\*/g,
            \`<span style='\${
              selectedCustom.text.italicBold.useCustomCSS
                ? selectedCustom.text.italicBold.customCSS
                : "font-style:italic; font-weight:bold; color:" + selectedCustom.text.italicBold.color
            }'>$1</span>\`
          );

          processedLine = processedLine.replace(
            /\\*\\*(.*?)\\*\\*/g,
            \`<span style='\${
              selectedCustom.text.bold.useCustomCSS
                ? selectedCustom.text.bold.customCSS
                : "font-weight:bold; color:" + selectedCustom.text.bold.color
            }'>$1</span>\`
          );

          processedLine = processedLine.replace(
            /\\*(.*?)\\*/g,
            \`<span style='\${
              selectedCustom.text.italic.useCustomCSS
                ? selectedCustom.text.italic.customCSS
                : "font-style:italic; color:" + selectedCustom.text.italic.color
            }'>$1</span>\`
          );

          currentLines.push(processedLine);
        } else if (currentLines.length > 0) {
          const paragraph = currentLines.join("<br/>");
          paragraphs.push(
            selectedCustom.box.isCustomMode
              ? selectedCustom.box.customPTag.replaceAll("{{line}}", paragraph)
              : \`<p style="margin: 1.25em 0">\${paragraph}</p>\`
          );
          currentLines.length = 0;
        }
      });

      if (currentLines.length > 0) {
        const paragraph = currentLines.join("<br/>");
        paragraphs.push(
          selectedCustom.box.isCustomMode
            ? selectedCustom.box.customPTag.replaceAll("{{line}}", paragraph)
            : \`<p style="margin: 1.25em 0">\${paragraph}</p>\`
        );
      }

      let result = paragraphs.join("\\n");

      if (config.removeAsterisk) {
        result = result.replace(/\\*+/g, "");
      }

      if (!selectedCustom.box.isCustomMode) {
        result = \`<div style="max-width: 800px; border-radius: \${selectedCustom.box.borderRadius}px; margin: 0 auto; padding: 2rem; box-shadow: \${selectedCustom.box.shadow.x}px \${selectedCustom.box.shadow.y}px \${selectedCustom.box.shadow.blur}px \${selectedCustom.box.shadow.spread}px \${selectedCustom.box.shadow.color}; background-color: \${selectedCustom.box.backgroundColor};"><span style="font-size: 1.25rem; line-height: 1.75rem; color: \${selectedCustom.text.normal.color};">\${name}</span>\${result}</div>\`;
      } else {
        const arr = [
          [/\\{\\{image(?:::(.*?))?\\}\\}/g, selectedCustom.box.customImages],
          [/\\{\\{text(?:::(.*?))?\\}\\}/g, selectedCustom.box.customTexts],
          [/\\{\\{color(?:::(.*?))?\\}\\}/g, selectedCustom.box.customColors],
        ];

        let cbsHTML = selectedCustom.box.customHTML;
        for (let i = 0; i < 3; i++) {
          let index = 0;
          cbsHTML = cbsHTML.replace(arr[i][0], () => arr[i][1][index++] || "");
        }

        result = cbsHTML
          .replaceAll("{{content}}", result)
          .replaceAll("{{name}}", name)
          .replaceAll("\\n", "");
      }

      return result;
    };

    const copyToClipboard = (html) => {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Failed to copy", err);
      }
      document.body.removeChild(textarea);
    };

   const chatToolbars = document.querySelectorAll(".chat-width > div.flex");
    
    if (chatToolbars.length > 0) {
      chatToolbars.forEach(toolbar => {
        toolbar.querySelectorAll(".beautify-copy-btn").forEach(btn => btn.remove());

        ${
          sanitization.personaUseCharacterCustom
            ? ""
            : `const personaCopyButton = document.createElement("button");
        personaCopyButton.className = "ml-2 hover:text-green-500 transition-colors beautify-copy-btn";
        personaCopyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-contact-round"><path d="M16 2v2"/><path d="M17.915 22a6 6 0 0 0-12 0"/><path d="M8 2v2"/><circle cx="12" cy="12" r="4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>';
        
        personaCopyButton.onclick = async (e) => {
          const chattext = e.target.closest(".risu-chat").querySelector(".chattext");
          const name = e.target.closest(".chat-width").querySelector(".chat-width");
          if (!chattext) return;
          const processedHtml = await processText(chattext.innerText, false, name.innerText);
          copyToClipboard(processedHtml);
        };
        
        toolbar.insertBefore(personaCopyButton, toolbar.firstChild);`
        }

        const botCopyButton = document.createElement("button");
        botCopyButton.className = "ml-2 hover:text-green-500 transition-colors beautify-copy-btn";
        botCopyButton.innerHTML = '<svg style="pointer-events:none;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square"><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>';
        
        botCopyButton.onclick = async (e) => {
          const chattext = e.target.closest(".risu-chat").querySelector(".chattext");
          const name = e.target.closest(".chat-width").querySelector(".chat-width");
          if (!chattext) return;
          const processedHtml = await processText(chattext.innerText, true, name.innerText);
          copyToClipboard(processedHtml);
        };
        
        toolbar.insertBefore(botCopyButton, toolbar.firstChild);
      });
    }
  })();`;

  // Remove whitespace and newlines for bookmarklet format
  return bookmarkletCode
    .replace(/\s+/g, " ")
    .replace(/[\n\r]/g, "")
    .trim();
};
