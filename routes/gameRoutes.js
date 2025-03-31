const express = require('express');
const gameController = require('../controllers/gameController');
const { authenticate, authorize } = require('../utils/auth');

const router = express.Router();

// 添加游戏（需要管理员权限）
router.post('/', authenticate, authorize('顶级管理员'), gameController.addGame);
// 查询游戏
router.get('/', authenticate, authenticate, gameController.queryGame);

module.exports = router;