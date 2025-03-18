const gameService = require('../services/gameService');
const { successResponse, errorResponse } = require('../utils/response');

const addGame = async (req, res) => {
  try {
    const { gameName, description } = req.body;

    // 调用服务层添加游戏
    const game = await gameService.addGame({ gameName, description });

    // 返回成功响应
    res.status(201).json(successResponse(game, 'Game added successfully'));
  } catch (error) {
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};

module.exports = {
  addGame,
};