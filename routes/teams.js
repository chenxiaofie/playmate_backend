const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../utils/auth');

// 创建团队
router.post('/', authenticate, teamController.createTeam);

// // 获取所有团队
// router.get('/', authenticate,authenticate('顶级管理员') ,teamController.getAllTeams);

// 根据 ID 获取单个团队
router.get('/:id', authenticate, teamController.getTeamById);

// // 更新团队
// router.put('/:id', authenticate, teamController.updateTeam);

// // 删除团队
// router.delete('/:id', authenticate, teamController.deleteTeam);

// 根据id加入某个团队
router.post('/:id', authenticate, teamController.joinTeam);
module.exports = router;
