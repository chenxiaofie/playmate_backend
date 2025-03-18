const { Games } = require('../models');

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

module.exports = {
  addGame,
};