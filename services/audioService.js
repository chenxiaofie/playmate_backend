const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

class AudioService {
  constructor() {
    this.uploadDir = 'uploads/audio/';
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // 文件名格式：user_id_timestamp_random.ext
        const uniqueSuffix = `${req.user.user_id}_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

    this.fileFilter = (req, file, cb) => {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm'];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('只支持音频文件格式：MP3, WAV, OGG, M4A, WEBM'), false);
      }
    };

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    });
  }

  // 获取音频文件列表
  async getAudioList(userId) {
    try {
      const files = await fs.readdir(this.uploadDir);
      const audioList = await Promise.all(
        files.map(async (filename) => {
          // 只返回属于当前用户的文件
          if (!filename.startsWith(userId + '_')) {
            return null;
          }

          const stats = await fs.stat(path.join(this.uploadDir, filename));
          return {
            id: filename,
            filename,
            size: stats.size,
            uploadTime: stats.mtime,
            path: path.join(this.uploadDir, filename),
            user_id: userId,
          };
        })
      );
      return audioList.filter((file) => file !== null);
    } catch (error) {
      throw new Error('获取音频文件列表失败: ' + error.message);
    }
  }

  // 获取单个音频文件信息
  async getAudioInfo(filename, userId) {
    try {
      // 验证文件所有权
      if (!filename.startsWith(userId + '_')) {
        return null;
      }

      const filePath = path.join(this.uploadDir, filename);
      const stats = await fs.stat(filePath);
      return {
        id: filename,
        filename,
        size: stats.size,
        uploadTime: stats.mtime,
        path: filePath,
        user_id: userId,
      };
    } catch (error) {
      throw new Error('获取音频文件信息失败: ' + error.message);
    }
  }

  // 删除音频文件
  async deleteAudio(filename, userId) {
    try {
      // 验证文件所有权
      if (!filename.startsWith(userId + '_')) {
        throw new Error('无权删除此文件');
      }

      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw new Error('删除音频文件失败: ' + error.message);
    }
  }
}

module.exports = new AudioService();
