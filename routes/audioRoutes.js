const express = require('express');
const audioController = require('../controllers/audioController');
const audioService = require('../services/audioService');
const { authenticate } = require('../utils/auth');
const router = express.Router();

// 使用 authenticate 中间件验证用户身份
router.use(authenticate);

// GET /audio - 获取音频文件列表
// router.get('/', audioController.getAudioList);

// GET /audio/:id - 获取单个音频文件信息
// router.get('/:id', audioController.getAudioInfo);

// POST /audio - 上传新音频文件
router.post('/', audioService.upload.single('audio'), audioController.uploadAudio);

// DELETE /audio/:id - 删除音频文件
// router.delete('/:id', audioController.deleteAudio);

module.exports = router;
