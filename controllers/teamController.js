const teamService = require('../services/teamService');
const { successResponse, errorResponse } = require('../utils/response');

// 创建团队
const createTeam = async (req, res) => {
  try {
    const { teamName, plan_id, max_members } = req.body;
    const newTeam = await teamService.createTeam(teamName, max_members, req.user.user_id, plan_id);
    res.status(200).json(successResponse(newTeam, '团队创建成功'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// 加入团队
const joinTeam = async (req, res) => {
  try {
    const teamId = req.params.id; // 从 URL 参数获取 teamId
    const userId = req.user.user_id; // 从登录态获取 userId
    const { gamesData, description, voiceIntro } = req.body;

    const result = await teamService.joinTeam({
      teamId,
      userId,
      gamesData,
      description,
      voiceIntro,
    });

    res.status(200).json(successResponse(result, '成功加入团队'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// 获取团队信息
const getTeamById = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { gameId, tagId, partnerName } = req.query; // 从查询参数获取过滤条件

    const team = await teamService.getTeamById(teamId, {
      gameId: gameId ? parseInt(gameId) : undefined,
      tagId: tagId ? parseInt(tagId) : undefined,
      partnerName,
    });

    res.status(200).json(successResponse(team));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeamById,
};
