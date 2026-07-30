/**
 * server/services/fileService.ts
 * File upload/download/listing orchestration.
 */

import fs from 'fs';
import { fileRepository, DbFile } from '../repositories/fileRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const fileService = {
  upload(data: {
    projectId: string | null;
    nodeId: string | null;
    uploadedBy: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
  }) {
    const file = fileRepository.create(data);
    return {
      id: file.id,
      originalName: file.original_name,
      mimeType: file.mime_type,
      sizeBytes: file.size_bytes,
      url: `/api/v1/files/${file.id}`,
    };
  },

  getForDownload(fileId: string): DbFile {
    const file = fileRepository.findById(fileId);
    if (!file) throw new NotFoundError('File');
    if (!fs.existsSync(file.storage_path)) throw new NotFoundError('File data');
    return file;
  },

  listByProject(projectId: string) {
    return fileRepository.listByProject(projectId);
  },

  delete(fileId: string, userId: string): void {
    const file = fileRepository.findById(fileId);
    if (!file) throw new NotFoundError('File');
    if (file.uploaded_by !== userId) throw new ForbiddenError();

    fileRepository.softDelete(fileId);
    // Schedule physical deletion (future job)
  },
};
