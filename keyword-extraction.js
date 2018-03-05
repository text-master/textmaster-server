const retext = require('retext');
const keywords = require('retext-keywords');
const nlcstToString = require('nlcst-to-string');

const extractKeywords = text => {
  return new Promise((resolve, reject) => {
    retext()
      .use(keywords)
      .process(text, function(err, file) {
        if (err) throw err;
        var keywordsResult = file.data.keyphrases.map(function(phrase) {
          return phrase.matches[0].nodes.map(nlcstToString).join('');
        });
        resolve(keywordsResult);
      });
  });
};

module.exports = extractKeywords;
