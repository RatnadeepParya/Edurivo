const fs = require('fs');
const path = require('path');
const { storage, isMock } = require('../config/firebase');
const appConfig = require('../config/app.config');
const logger = require('../config/logger');

class StorageRepo {
  constructor() {
    this.localUploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Saves a file buffer either to Firebase Storage or local uploads
   */
  async uploadFile(fileBuffer, destinationPath, mimeType) {
    try {
      if (!isMock && storage) {
        const bucket = storage.bucket(appConfig.firebase?.storageBucket);
        const file = bucket.file(destinationPath);
        await file.save(fileBuffer, {
          contentType: mimeType,
          metadata: {
            cacheControl: 'public, max-age=31536000'
          }
        });
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        });
        return signedUrl;
      }
    } catch (e) {
      logger.warn('Cloud Storage upload failed, utilizing local filesystem: %s', e.message);
    }

    // Local filesystem fallback
    const targetFilePath = path.join(this.localUploadDir, path.basename(destinationPath));
    const targetDir = path.dirname(targetFilePath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFilePath, fileBuffer);
    return `/uploads/${path.basename(destinationPath)}`;
  }
}

module.exports = new StorageRepo();
