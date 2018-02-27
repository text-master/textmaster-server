const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017/vocabulary';

const DbConnection = () => {
  let db = null;

  async function connect() {
    try {
      let _db = await MongoClient.connect(url);
      return _db;
    } catch (e) {
      return e;
    }
  }

  async function get() {
    try {
      if (db != null) {
        console.log(`db connection is already alive`);
        return db;
      } else {
        console.log(`getting new db connection`);
        db = await connect();

        return db;
      }
    } catch (e) {
      return e;
    }
  }

  return {
    get: get,
  };
};

module.exports = DbConnection();
