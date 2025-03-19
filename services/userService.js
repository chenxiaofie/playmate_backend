const bcrypt = require('bcrypt');
const { User, Role, Order } = require('../models');
const snowflake = require('../utils/snowflake'); // 引入雪花算法工具
const { verifyCode } = require('./smsService');
const logger = require('../utils/logger'); // 引入日志模块
const register = async (userData) => {
  const { username, password, phone, role = 4 } = userData;

  // 检查用户名是否已存在
  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) {
    throw new Error('用户名已存在');
  }


  // // 检查邮箱是否已存在
  // const existingUserByEmail = await User.findOne({ where: { email } });
  // if (existingUserByEmail) {
  //   throw new Error('邮箱已存在');
  // }

  // 检查手机号是否已存在
  const existingUserByPhone = await User.findOne({ where: { phone } });
  if (existingUserByPhone) {
    throw new Error('手机号已存在');
  }

  // 使用雪花算法生成 user_id
  const userId = snowflake.generate();

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await User.create({
    user_id: userId, // 使用雪花算法生成的 ID
    username,
    password: hashedPassword,
    // email,
    phone,
  });

  if (role) {
    // 分配角色
    const userRole = await Role.findOne({ where: { role_id: role } });
    if (!userRole) {
      throw new Error('分配角色不存在');
    }
    await user.addRole(userRole);
  }
  // ✅ 查询用户并附带角色信息返回
  const userWithRoles = await User.findOne({
    where: { user_id: user.user_id },
    include: [{ model: Role, through: { attributes: [] } }],
  });

  return userWithRoles;
};
const login = async (username, password, phone, verificationCode, clientIP) => {
  // 🚨 确保至少有一个有效值
  if (!username && !phone) {
    throw new Error("用户名或手机号必填");
  }

  // 如果通过手机号登录
  if (phone && !username && !password) {
    // 验证验证码
    if (!verificationCode) {
      throw new Error(`${phone} 验证码必填`);
    }

    await verifyCode(phone, verificationCode); // 验证验证码

    // 查找用户
    const user = await User.findOne({
      where: { phone },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      // 如果用户不存在，自动注册
      // snowflake.generate(),
      const newUser = await register({ username: phone, password: '123', phone });
      logger.user.info(`用户手机号自动注册成功:${clientIP} ${phone}`);
      return newUser.toJSON();
    }
    logger.user.info(`用户登录成功:${clientIP} ${phone}`);
    return user.toJSON();
  }

  // 如果通过用户名和密码登录
  if (username && password && !phone) {
    // 构建查询条件
    const whereCondition = { username };

    const user = await User.findOne({
      where: whereCondition,
      attributes: { include: ['password'] }, // 明确指定 User 的字段
      include: [{ model: Role, attributes: { exclude: ['password'] }, through: { attributes: [] } }], // 确保 Role 里没有 password
    });


    if (!user) {
      throw new Error(`${username} 用户不存在`);
    }

    // 🚨 如果 `user.password` 为空，这里会报错
    if (!user.password) {
      throw new Error(`${username} 密码不能为空`);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 记录登录失败
      throw new Error(`用户名或密码错误`);
    }

    // 记录登录成功
    logger.user.info(`用户登录成功:${clientIP} ${username}`);
    return user.toJSON();
  }

  // 如果参数不合法
  throw new Error('无效的登录方式');
};

const getUserInfo = async (user) => {
   // 获取用户并排除循环引用
   const userData = await user.toJSON();  // 使用 toJSON() 转换为纯对象
  
  // 查询用户最新的订单
  const latestOrder = await Order.findOne({
    where: { user_id: userData.user_id },
    order: [["createdAt", "DESC"]] // 获取最近的一笔订单
  });
  return { ...userData, latestOrder }; // 合并数据
};

module.exports = {
  register,
  login,
  getUserInfo
};