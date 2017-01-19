/*
 * Copyright (C) 2017, Sencha Inc.
 */

const Feed = require('./lib/Feed'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/feed', async function(req, res) {
    const url = req.body.url;
    try {
        const data = await new Feed(url).fetch();
        res.send({
            total: data.length,
            feed:  {
                entries: data.map((r) => {
                    return {
                        title: r.title,
                        author: r.author,
                        link: r.link,
                        categories: r.categories,
                        url: url,
                        publishedDate: r.pubDate,
                        content: r.description,
                        contentSnippet: r.summary
                    }
                })
            }
        });
    }
    catch (e) {
        console.dir(e);
    }
});

app.listen(8080, () => {
    console.log('google-feed-replacement listening on port 8080');
});
