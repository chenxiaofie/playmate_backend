# 这个一个陪玩管理的业务后台 [文档地址](https://1ly8xqh4op.apifox.cn/)

# 目录结构
```
src/
├── config/                  # 配置文件
│   └── db.js                # 数据库配置
├── controllers/             # 控制器
│   ├── userController.js    # 用户相关逻辑
│   ├── gameController.js    # 游戏相关逻辑
│   ├── orderController.js   # 订单相关逻辑
│   └── paymentController.js # 支付相关逻辑
├── models/                  # 数据库模型
│   ├── user.js              # 用户模型
│   ├── game.js              # 游戏模型
│   ├── order.js             # 订单模型
│   └── index.js             # 模型初始化
├── routes/                  # 路由
│   ├── userRoutes.js        # 用户路由
│   ├── gameRoutes.js        # 游戏路由
│   ├── orderRoutes.js       # 订单路由
│   └── index.js             # 路由入口
├── services/                # 业务逻辑
│   ├── userService.js       # 用户服务
│   ├── gameService.js       # 游戏服务
│   ├── orderService.js      # 订单服务
│   └── paymentService.js    # 支付服务
├── utils/                   # 工具函数
│   ├── auth.js              # 身份验证
│   └── response.js          # 统一响应格式
├── app.js                   # 应用入口
└── server.js                # 启动文件
```
