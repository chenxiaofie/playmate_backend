const audioService = require('../services/audioService');
const { successResponse, errorResponse } = require('../utils/response');

class AudioController {
  // 获取音频文件列表
  async getAudioList(req, res) {
    try {
      const audioList = await audioService.getAudioList(req.user.user_id);
      res.status(200).json(successResponse(audioList, '获取音频文件列表成功'));
    } catch (error) {
      res.status(500).json(errorResponse('获取音频文件列表失败: ' + error.message));
    }
  }

  // 获取单个音频文件信息
  async getAudioInfo(req, res) {
    try {
      const audioInfo = await audioService.getAudioInfo(req.params.id, req.user.user_id);
      if (!audioInfo) {
        return res.status(404).json(errorResponse('音频文件不存在或无权访问'));
      }
      res.status(200).json(successResponse(audioInfo, '获取音频文件信息成功'));
    } catch (error) {
      res.status(500).json(errorResponse('获取音频文件信息失败: ' + error.message));
    }
  }

  // 上传音频文件
  async uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('请确保上传了有效的音频文件'));
      }

      const audioInfo = await audioService.getAudioInfo(req.file.filename, req.user.user_id);
      res.status(200).json(successResponse(audioInfo, '音频文件上传成功'));
    } catch (error) {
      res.status(500).json(errorResponse('音频文件上传失败: ' + error.message));
    }
  }

  // 删除音频文件
  async deleteAudio(req, res) {
    try {
      await audioService.deleteAudio(req.params.id, req.user.user_id);
      res.status(200).json(successResponse(null, '音频文件删除成功'));
    } catch (error) {
      res.status(500).json(errorResponse('删除音频文件失败: ' + error.message));
    }
  }
}

module.exports = new AudioController();
