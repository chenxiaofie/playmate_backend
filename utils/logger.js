const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, module }) => {
  return `${timestamp} [${level}] [${module}]: ${message}`;
});

// 定义日志配置 Map
const logConfigMap = new Map([
  ['user', { filename: 'logs/user-%DATE%.log', level: 'info' }],
  ['order', { filename: 'logs/order-%DATE%.log', level: 'info' }],
  ['payment', { filename: 'logs/payment-%DATE%.log', level: 'info' }],
]);

// 创建日志对象
const log = {};

// 通用创建 Logger 方法
const createLogger = (module) => {
  return winston.createLogger({
    level: logConfigMap.get(module)?.level || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
      new DailyRotateFile({
        filename: logConfigMap.get(module)?.filename || 'logs/default-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new winston.transports.Console({ format: combine(colorize(), logFormat) }),
    ],
  }).child({ module });
};

// 初始化所有模块日志
for (const moduleName of logConfigMap.keys()) {
  log[moduleName] = createLogger(moduleName);
}

// 默认日志（当 `log.xxx` 不存在时）
log.default = createLogger('default');

// 代理对象：支持 `log.xxx` 访问，也支持 `log.info()` 作为默认日志
const logProxy = new Proxy(log, {
  get(target, prop) {
    // 如果访问 `log.xxx`，返回该模块的 Logger
    if (prop in target) {
      return target[prop];
    }
    // 如果访问 `log.info()`、`log.error()`，则使用默认日志
    if (prop in target.default) {
      return target.default[prop];
    }
    return undefined;
  },
});



module.exports = logProxy;
