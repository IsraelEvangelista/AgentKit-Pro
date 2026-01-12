---
name: excel-export-browser
description: Exporta .xlsx no browser com nome correto, evitando interferência do GTM.
---

# Excel Export (Browser)

## Instruções

1. Identifique o problema
   - Ao gerar Excel no browser com `xlsx`/`exceljs`, podem ocorrer:
     - Nome de arquivo virando UUID
     - Download aparecer no histórico, mas não salvar
     - Extensão `.xlsx` não ser aplicada
   - Uma causa comum é o Google Tag Manager (GTM) interceptando `<a>` dinâmicos e corrompendo `download`.

2. Use a solução mais robusta (recomendada)
   - Priorize a File System Access API (`showSaveFilePicker`) para abrir o diálogo nativo e evitar interceptação por scripts.

3. Garanta fallback para browsers sem suporte
   - Para Safari/Firefox antigos, use `XLSX.writeFile`.
   - Se houver GTM, aplique o workaround do SheetJS para reduzir interferência.

4. Teste em múltiplos browsers
   - Chrome/Edge (suporte melhor)
   - Firefox/Safari (validar fallback)

## Exemplos

### Exemplo 1: Exportação usando File System Access API

Pré-requisito:

```bash
npm install xlsx
```

Implementação:

```typescript
import * as XLSX from "xlsx";

declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
  name: string;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  close(): Promise<void>;
}

export const exportToExcel = async (data: unknown[][], suggestedFileName: string): Promise<void> => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  worksheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

  if (window.showSaveFilePicker) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: suggestedFileName,
      types: [
        {
          description: "Arquivo Excel (.xlsx)",
          accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
          },
        },
      ],
    });

    const writableStream = await fileHandle.createWritable();
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    await writableStream.write(excelBuffer);
    await writableStream.close();
    return;
  }

  XLSX.writeFile(workbook, suggestedFileName);
};
```

### Exemplo 2: Workaround para GTM (fallback)

```typescript
const originalCreateElement = document.createElement.bind(document);

document.createElement = function (tagName: string, options?: ElementCreationOptions) {
  const element = originalCreateElement(tagName, options);
  if (tagName.toLowerCase() === "a") {
    (element as HTMLAnchorElement).target = "_blank";
  }
  return element;
};

XLSX.writeFile(workbook, fileName);

setTimeout(() => {
  document.createElement = originalCreateElement;
}, 1000);
```

### Exemplo 3: Referências

- https://docs.sheetjs.com/docs/demos/local/file/
- https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
- https://docs.sheetjs.com/docs/demos/local/file/#google-tag-manager
