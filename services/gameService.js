const { Games } = require('../models');
const { Op } = require('sequelize');
const addGame = async (gameData) => {
  // 检查游戏是否已存在
  const existingGame = await Games.findOne({ where: { gameName: gameData.gameName } });
  if (existingGame) {
    throw new Error('Game already exists');
  }

  // 创建新游戏
  const game = await Games.create(gameData);
  return game;
};



const queryGames = async ({ game_name }) => {
  // 构建查询条件
  const where = {};
  if (game_name) {
    where.game_name = {
      [Op.like]: `%${game_name}%` // 模糊查询游戏名称
    };
  }

  // 查询所有符合条件的游戏
  const games = await Games.findAll({
    where,
    order: [['createdAt', 'DESC']] // 按创建时间倒序
  });

  return games;
};

module.exports = {
  addGame,
  queryGames
};