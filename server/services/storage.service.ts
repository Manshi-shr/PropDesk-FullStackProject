import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export interface StorageService {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<{ fileUrl: string; fileName: string; fileSize: number }>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageService implements StorageService {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const ext = path.extname(originalName) || '.pdf';
    const safeName = `${Date.now()}_${path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);
    
    await fs.promises.writeFile(filePath, buffer);
    
    return {
      fileUrl: `/uploads/${safeName}`,
      fileName: originalName,
      fileSize: buffer.length,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const storageService = new LocalStorageService();
