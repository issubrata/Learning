class Sequelize {
  async authenticate() {
    // no-op for in-memory implementation
  }
  async sync() {
    // no-op
  }
}

const sequelize = new Sequelize();

module.exports = { sequelize };
