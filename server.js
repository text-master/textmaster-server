const server = require('http').createServer();
const io = require('socket.io')(server);
const ioreq = require('socket.io-request');
const SummaryTool = require('./summary');
const htmlToText = require('html-to-text');
const DbConnection = require('./db-connection');
const extractKeywords = require('./keyword-extraction');
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

io.on('connection', async function(socket) {
  const db = await DbConnection.get();
  console.log('a user connected');

  socket.on('disconnect', function() {
    // db.close();
    console.log('user disconnected');
  });

  ioreq(socket).response('suggestion', function(req, res) {
    const { topic, prefix } = req;
    const regex = {
      $regex: new RegExp('^' + prefix),
    };

    const cursor = db
      .collection(topic)
      .find({
        Word: regex,
      })
      .sort({
        Count: -1,
      })
      .limit(10);

    cursor.toArray(function(err, docs) {
      res(docs);
    });
  });
});
