const crypto = require('crypto');
// 生成随机验证码
const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString(); // 生成 6 位随机数
};

module.exports = { generateVerificationCode };