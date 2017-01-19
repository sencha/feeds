/*
 * Copyright (C) 2017, Sencha Inc.
 */

const request = require('request'),
    FeedParser = require('feedparser'),
    Iconv = require ('iconv').Iconv;

class Feed {
    constructor(url) {
        this.url = url;
    }

    fetch () {
        const me = this;

        return new Promise((resolve, reject) => {
            // Define our streams
            const req = request(me.url, {timeout: 10000, pool: false});
            const data = [];

            req.setMaxListeners(50);
            // Some feeds do not respond without user-agent and accept headers.
            req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
            req.setHeader('accept', 'text/html,application/xhtml+xml');

            const feedparser = new FeedParser();

            // Define our handlers
            req.on('error', function(err) {
                reject(err);
            })

            req.on('response', function(res) {
                if (res.statusCode != 200) {
                    return me.emit('error', new Error('Bad status code'));
                }
                const charset = Feed.getParams(res.headers['content-type'] || '').charset;
                res = Feed.maybeTranslate(res, charset);
                // And boom goes the dynamite
                res.pipe(feedparser);
            });

            feedparser.on('error', e => {
                reject(e);
            })

            feedparser.on('end', () => {
                resolve(data);
            })

            feedparser.on('readable', function() {
                let post;
                while (post = this.read()) {
                    data.push(post);
                }
            })
        })
    }

    static maybeTranslate (res, charset) {
        let iconv;
        
        // Use iconv if its not utf8 already.
        if (!iconv && charset && !/utf-*8/i.test(charset)) {
            try {
                iconv = new Iconv(charset, 'utf-8');
                // console.log('Converting from charset %s to utf-8', charset);
                iconv.on('error', done);
                // If we're using iconv, stream will be the output of iconv
                // otherwise it will remain the output of request
                res = res.pipe(iconv);
            } catch(err) {
                res.emit('error', err);
            }
        }
        return res;
    }

    static getParams (str) {
        const params = str.split(';').reduce(function (params, param) {
            const parts = param.split('=').map(function (part) { return part.trim(); });
            if (parts.length === 2) {
                params[parts[0]] = parts[1];
            }
            return params;
        }, {});
        return params;
    }
}

module.exports = Feed;
