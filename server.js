const server = require('http').createServer();
const io = require('socket.io')(server);
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

  socket.on('suggestion', function(data) {
    const { topic, prefix } = data;

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
      socket.emit('suggestion', docs);
    });
  });

  socket.on('follower', function(data) {
    console.log(data);
    const { topic, preword } = data;

    const cursor = db.collection(topic).find({
      Word: preword,
    });

    cursor.toArray(function(err, docs) {
      socket.emit('follower', docs);
    });
  });

  socket.on('summarize', async function(html) {
    const content = htmlToText.fromString(html, {
      ignoreHref: true,
      ignoreImage: true,
    });

    const keywords = await extractKeywords(content);

    SummaryTool.summarize('', content, function(err, summary) {
      if (err) console.log('Something went wrong man!');

      // console.log(summary);
      const data = {
        summary: summary,
        contentLength: content.length,
        summaryLength: summary.length,
        summaryRatio: 100 - 100 * (summary.length / content.length),
        keywords: keywords,
      };
      socket.emit('summarize', data);
    });
  });
});
