const { Games, GameTag, Tag } = require('../models');
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
      [Op.like]: `%${game_name}%`, // 模糊查询游戏名称
    };
  }

  // 查询所有符合条件的游戏，包含GameTag和Tag表数据
  const games = await Games.findAll({
    where,
    include: [
      {
        model: GameTag,
        as: 'gameTagRelations',
        attributes: ['game_id', 'tag_id'],
        include: [
          {
            model: Tag,
            as: 'gameTagRelation',
            attributes: ['tag_id', 'tag_name', 'tag_type'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']], // 按创建时间倒序
  });

  // 优化返回数据格式
  return games.map((game) => {
    const gameData = game.toJSON();
    return {
      ...gameData,
      ranks: gameData.rank_data?.ranks || [],
      tags: (gameData.gameTagRelations || []).map((relation) => ({
        id: relation.gameTagRelation.tag_id,
        name: relation.gameTagRelation.tag_name,
        type: relation.gameTagRelation.tag_type,
      })),
      gameTagRelations: undefined,
      rank_data: undefined,
    };
  });
};

module.exports = {
  addGame,
  queryGames,
};
