const redisClient = require('../utils/redis');
const { generateVerificationCode } = require('../utils/helpers');
const logger = require('../utils/logger'); // 引入日志模块
// const SMSClient = require('@alicloud/sms-sdk'); // 使用阿里云短信服务

// // 阿里云短信服务的配置
// const accessKeyId = 'your-access-key-id';
// const secretAccessKey = 'your-secret-access-key';
// const smsClient = new SMSClient({ accessKeyId, secretAccessKey });
// 发送验证码的逻辑
const sendVerificationCode = async (phoneNumber) => {
    if (!phoneNumber) {
        throw new Error('手机号不能为空');
    }

    // 手机号格式验证（假设是中国手机号）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        throw new Error('手机号格式不正确');
    }

    const code = generateVerificationCode();
    const key = `verification_code:${phoneNumber}`;
    const timeKey = `verification_time:${phoneNumber}`;

    try {
        // 检查是否在限制时间内
        const lastSentTime = await redisClient.get(timeKey);
        const currentTime = Date.now();
        const limitTime = 60 * 1000; // 1 分钟限制

        if (lastSentTime && currentTime - parseInt(lastSentTime, 10) < limitTime) {
            logger.user.warn(`手机号 ${phoneNumber} 请求过于频繁`);
            throw new Error(`短信发送失败: 请求过于频繁，请 ${Math.ceil((limitTime - (currentTime - parseInt(lastSentTime, 10))) / 1000)} 秒后再试`);
        }

        // 发送验证码（这里模拟成功发送）
        const result = { Code: 'OK' };

        if (result.Code === 'OK') {
            // 存储验证码和发送时间
            await redisClient.set(key, code, { EX: 60 }); // 验证码 1 分钟过期
            await redisClient.set(timeKey, currentTime, { EX: 60 }); // 限制 1 分钟内不能重复发送
            logger.user.info(`验证码已发送至 ${phoneNumber}: ${code}`);
            return  code
        } else {
            logger.user.error(`短信发送失败: ${result.Message}`);
            throw new Error(`短信发送失败: ${result.Message}`);
        }
    } catch (error) {
        logger.error(`短信服务错误: ${error.message}`);
        throw new Error(`短信服务错误: ${error.message}`);
    }
};



const verifyCode = async (phone, inputCode) => {
    const key = `verification_code:${phone}`;

    // 从 Redis 中获取验证码
    const storedCode = await redisClient.get(key);

    if (!storedCode) {
        throw new Error('验证码已过期或未发送');
    }

    // 验证验证码
    if (inputCode !== storedCode) {
        throw new Error('验证码错误');
    }

    // 验证成功后删除 Redis 中的验证码
    await redisClient.del(key);
    return true;
};

module.exports = { sendVerificationCode, verifyCode };