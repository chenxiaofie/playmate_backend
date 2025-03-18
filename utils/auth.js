const jwt = require('jsonwebtoken');
const{errorResponse} =require('./response')
const { User, Role } = require('../models');
require('dotenv').config(); // 加载 .env 文件

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Token 未提供或格式错误'));
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json(errorResponse('无效的 Token 或已过期'));
    }

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      return res.status(404).json(errorResponse('用户不存在'));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('身份验证失败:', error);
    res.status(500).json(errorResponse('服务器错误，请稍后再试'));
  }
};

const authorize = (roleName) => {
  return (req, res, next) => {
    const hasRole = req.user.Roles.some((role) => role.roleName === roleName);
    if (!hasRole) {
      return res.status(403).json(errorResponse('Access denied'));
    }
    next();
  };
};

module.exports = { generateToken, verifyToken,authenticate,authorize};