const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { errorResponse } = require('./utils/response');
const swaggerSetup = require('./doc/swagger'); // 引入 Swagger 配置
const logger = require('./utils/logger'); // 引入日志模块
const middlewares = require('./middlewares'); // 自动引入 index.js
const path = require('path');
const tasks = require('./tasks'); // 引入定时任务模块

const app = express();

// 使用中间件
app.use(middlewares.getClientIP);
// 中间件
app.use(cors()); // 允许跨域
app.use(morgan('dev')); // 日志记录
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码请求体
// 记录请求日志的中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 设置静态文件目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api', routes);

// 初始化 Swagger 文档
swaggerSetup(app);

// 启动定时任务
tasks.startTasks();

// 404 处理
app.use((req, res, next) => {
  logger.error(`404错误: ${req.url}`);
  res.status(404).json(errorResponse('Not Found'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  logger.error(`500错误: ${err.message}`);
  res.status(500).json(errorResponse('Internal Server Error'));
});

module.exports = app;
