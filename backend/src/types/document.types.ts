export type SupportedFileType = 'pdf' | 'txt' | 'csv';

export interface UploadedDocument {
  id: string;
  filename: string;
  size: number;
  fileType: SupportedFileType;
  content: string;
  createdAt: Date;
}

export interface DocumentUploadResult {
  id: string;
  filename: string;
  size: number;
  fileType: SupportedFileType;
  createdAt: Date;
}
