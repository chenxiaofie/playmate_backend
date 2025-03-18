class Snowflake {
    constructor(machineId = 0) {
      this.machineId = machineId; // 机器ID
      this.sequence = 0; // 序列号
      this.lastTimestamp = -1; // 上次生成ID的时间戳
    }
  
    // 生成ID
    generate() {
      let timestamp = Date.now();
  
      // 如果当前时间小于上次生成ID的时间，说明时钟回拨
      if (timestamp < this.lastTimestamp) {
        throw new Error('Clock moved backwards');
      }
  
      // 如果是同一毫秒内生成的，增加序列号
      if (timestamp === this.lastTimestamp) {
        this.sequence = (this.sequence + 1) & 0xfff; // 12位序列号
        if (this.sequence === 0) {
          // 序列号用尽，等待下一毫秒
          timestamp = this.waitNextMillis(timestamp);
        }
      } else {
        this.sequence = 0; // 新的一毫秒，重置序列号
      }
  
      this.lastTimestamp = timestamp;
  
      // 生成ID
      const id =
        ((BigInt(timestamp) << 22n) | // 时间戳左移22位
        ((BigInt(this.machineId) << 12n) | // 机器ID左移12位
        BigInt(this.sequence))); // 序列号
  
      return id.toString(); // 返回字符串形式的ID
    }
  
    // 等待下一毫秒
    waitNextMillis(timestamp) {
      while (timestamp <= this.lastTimestamp) {
        timestamp = Date.now();
      }
      return timestamp;
    }
  }
  
  // 单例模式，全局使用一个实例
  const snowflake = new Snowflake(1); // 假设机器ID为1
  module.exports = snowflake;