let urls = [];

class Url {
  static async findOne({ where }) {
    if (where && where.short_alias) {
      return urls.find(u => u.short_alias === where.short_alias) || null;
    }
    if (where && where.id) {
      return urls.find(u => u.id === where.id) || null;
    }
    return null;
  }

  static async create({ original_url, short_alias }) {
    const entry = {
      id: urls.length + 1,
      original_url,
      short_alias,
      created_at: new Date()
    };
    urls.push(entry);
    return entry;
  }
}

module.exports = Url;
