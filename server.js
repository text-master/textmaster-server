const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SummaryTool = require('./summary');
const htmlToText = require('html-to-text');
const retext = require('retext');
const keywords = require('retext-keywords');
const nlcstToString = require('nlcst-to-string');
const DbConnection = require('./db-connection');
const PORT = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.send('<h1>Hello world</h1>');
});

http.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

//cors
io.set('origins', '*:*');

io.on('connection', async function(socket) {
  const db = await DbConnection.get();
  console.log('a user connected');

  socket.on('disconnect', function() {
    // db.close();
    console.log('user disconnected');
  });

  socket.on('suggestion', function(data) {
    var { topic, prefix } = data;

    let regex = {
      $regex: new RegExp('^' + prefix),
    };

    var cursor = db
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
    var { topic, preword } = data;

    var cursor = db.collection(topic).find({
      Word: preword,
    });

    cursor.toArray(function(err, docs) {
      socket.emit('follower', docs);
    });
  });

  socket.on('summarize', function(html) {
    var content = htmlToText.fromString(html, {
      ignoreHref: true,
    });
    // console.log(content);
    // console.log(JSON.stringify(content));
    var keyWords;

    retext()
      .use(keywords)
      .process(content, function(err, file) {
        if (err) throw err;
        keyWords = file.data.keyphrases.map(function(phrase) {
          return phrase.matches[0].nodes.map(nlcstToString).join('');
        });
      });

    SummaryTool.summarize('', content, function(err, summary) {
      if (err) console.log('Something went wrong man!');

      // console.log(summary);
      var data = {
        summary: summary,
        contentLength: content.length,
        summaryLength: summary.length,
        summaryRatio: 100 - 100 * (summary.length / content.length),
        keyWords: keyWords,
      };
      socket.emit('summarize', data);
    });
  });
});
