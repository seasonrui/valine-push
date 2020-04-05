const Koa = require('koa');
const axios = require("axios");
const cheerio = require('cheerio');
const AV = require('leancloud-storage/live-query');
const {Query} = AV;
const barkServer = "https://api.day.app";
const barkUrl = `${barkServer}/${process.env.BARK_KEY}`;
const app = new Koa();
const appId = process.env.APP_ID;
const appKey = process.env.APP_KEY;
const serverURLs = process.env.SERVER_URLS;
const blogUrl = process.env.BLOG_URL;

AV.init({
  appId: appId,
  appKey: appKey,
  serverURLs: serverURLs,
});

const query = new Query('Comment');

query.subscribe().then(function (liveQuery) {
  liveQuery.on('create', function (newComment) {
    const comment = newComment.get('comment');
    const url = `${blogUrl}${newComment.get('url')}`;
    const $ = cheerio.load(comment);
    const text = $.text();
    axios.get(`${barkUrl}/${encodeURIComponent(url)}/${encodeURIComponent(text)}`, {
      params: {
        automaticallyCopy: 1
      }
    }).then(() => {
      console.log('success');
    }).catch((res) => {
      console.log(res);
    })
  });
});

app.listen(3000);
