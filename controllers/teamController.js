const teamService = require('../services/teamService');
const { successResponse, errorResponse } = require('../utils/response');

// 创建团队
const createTeam = async (req, res) => {
    try {
        const { teamName, plan_id, max_members } = req.body;
        const newTeam = await teamService.createTeam(teamName, max_members,req.user.user_id,plan_id);
        res.status(200).json(successResponse(newTeam, '团队创建成功'));
    } catch (error) {
        res.status(500).json(errorResponse(error.message));
    }
};

// 加入团队
const joinTeam = async (req, res) => {
    try {
        const teamId = req.params.id;  // 从URL参数获取团队id
        console.log('查看id',teamId)
        // ... 处理加入团队的逻辑 ...
        
    } catch (error) {
        res.status(500).json(errorResponse(error.message));
    }
};

module.exports = {
    createTeam,
    joinTeam
};