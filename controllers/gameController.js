const gameService = require('../services/gameService');
const { successResponse, errorResponse } = require('../utils/response');

const addGame = async (req, res) => {
  try {
    const { gameName, description } = req.body;

    // 调用服务层添加游戏
    const game = await gameService.addGame({ gameName, description });

    // 返回成功响应
    res.status(201).json(successResponse(game, '游戏添加成功'));
  } catch (error) {
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};

const queryGame = async (req, res) => {
  try {
    const { game_name } = req.query;

    // 调用服务层查询游戏
    const games = await gameService.queryGames({
      game_name,
    });

    // 返回成功响应
    res.status(200).json(successResponse(games, '游戏查询成功'));
  } catch (error) {
    // 返回错误响应
    res.status(500).json(errorResponse(error.message));
  }
};

module.exports = {
  addGame,
  queryGame,
};
