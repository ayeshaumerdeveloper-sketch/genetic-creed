"use client";

export type UploadType = "image" | "document";

  function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";

    input.multiple = false;

    const cleanup = () => {
      setTimeout(() => {
        if (input && input.parentNode) input.parentNode.removeChild(input);
      }, 0);
      window.removeEventListener("focus", onFocus);
    };

    const onChange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      cleanup();
      resolve(file);
    };

    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          cleanup();
          resolve(null);
        }
      }, 300);
    };

    input.addEventListener("change", onChange, { once: true });
    window.addEventListener("focus", onFocus, { once: true });

    document.body.appendChild(input);
    input.click();
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default async function uploadFile(type: UploadType): Promise<string | null> {
  const accept = type === "image"
    ? "image/*"
    : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.json,.md,.rtf";

  const file = await pickFile(accept);
  if (!file) return null;

  const sizeStr = formatSize(file.size);

  if (type === "image") {
    return `Image uploaded: ${file.name} (${sizeStr})`;
  }
  return `Document uploaded: ${file.name} (${sizeStr})`;
}