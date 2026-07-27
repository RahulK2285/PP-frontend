declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    Title: string;
    Author: string;
    Subject: string;
    Creator: string;
    Producer: string;
    CreationDate: string;
    ModDate: string;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: unknown;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: unknown): Promise<PDFData>;
  export = pdfParse;
}
