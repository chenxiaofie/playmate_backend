const app = require('./app');

const { sequelize } = require('./models'); // 导入 Sequelize 实例

const PORT = process.env.PORT || 3000;

// 同步数据库
sequelize.sync({ force: false }) // force: true 会删除并重新创建表
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});