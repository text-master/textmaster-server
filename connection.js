const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017/vocabulary';

let _connection;

process.on('unhandledRejection', up => {
  console.log(up);
});

const connect = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        reject(err);
      }
      resolve(db);
    });
  });
};

module.exports.connect = connect;
/**
 * Returns a promise of a `db` object. Subsequent calls to this function returns
 * the **same** promise, so it can be called any number of times without setting
 * up a new connection every time.
 */
const connection = () => {
  if (!_connection) {
    _connection = connect();
  }

  return _connection;
};

module.exports.connection = connection;
