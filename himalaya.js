(function() {
    var root = this;

    var tagStart = '<';
    var tagEnd = '>';
    var commentStart = '<!--';
    var commentEnd = '-->';

    var voidTags = [
        "!doctype", "area", "base", "br", "col", "command",
        "embed", "hr", "img", "input", "keygen", "link",
        "meta", "param", "source", "track", "wbr"
    ];
    var closingTags = [
        "colgroup", "dd", "dt", "li", "options", "p",
        "td", "tfoot", "th", "thead", "tr"
    ];
    var childlessTags = ['style', 'script', 'template'];
    var parseOptions = {};

    function parse(str, opts) {
        opts = opts || {};
        parseOptions = opts
        return parseUntil(str + '</root>', ['root']).nodes;
    }

    function Node(kind, data) {
        data.type = kind;
        return data;
    }

    function parseUntil(str, stack) {
        var nodes = [];

        while (str.length) {
            var nextTag = str.indexOf(tagStart);
            if (!~nextTag) {
                // only text left
                nodes.push(Node('text', {
                    value: str
                }));
                str = "";
            } else if (nextTag) {
                // text before tag
                nodes.push(Node('text', {
                    value: str.slice(0, nextTag)
                }));
                str = str.slice(nextTag);
            } else {
                if (startsWithCommentStart(str)) {
                    // comment
                    var end = str.indexOf(commentEnd);
                    nodes.push(Node('comment', {
                        value: str.slice(commentStart.length, end)
                    }));
                    str = str.slice(end + commentEnd.length);
                } else if (str.charAt(nextTag + 1) !== '/') {
                    // open tag
                    var results = parseTag(str, stack);
                    if (results.tag) {
                        nodes.push(Node('tag', results.tag));
                        str = results.str;
                    }
                    if (results.stack.length !== stack.length) {
                        stack = results.stack;
                        break;
                    }
                } else {
                    // close tag
                    var endTagEnd = str.indexOf(tagEnd);
                    var tagName = str.slice(2, endTagEnd)
                        .trim().split(' ')[0];
                    str = str.slice(endTagEnd + 1);
                    var loc = stack.lastIndexOf(tagName);
                    if (~loc) {
                        stack = stack.slice(0, loc);
                        break;
                    }
                }
            }
        }

        return {
            nodes: nodes,
            stack: stack,
            str: str
        };
    }

    function parseTag(str, stack) {
        var idxTagEnd = str.indexOf(tagEnd);
        var idxSpace = str.indexOf(' ');
        var tagNameEnd = ~idxSpace ?
            Math.min(idxTagEnd, idxSpace) :
            idxTagEnd;
        var tagName = str.slice(1, tagNameEnd);
        var lowTagName = tagName.toLowerCase();

        if (stack[stack.length - 1] === tagName && ~closingTags.indexOf(lowTagName)) {
            return {
                stack: stack.slice(0, -1)
            };
        }

        var attrs = parseAttrs(str.slice(tagNameEnd));

        var tag = {
            name: tagName.replace(/\//, '')
        };
        if (Object.keys(attrs.attributes).length) {
            tag.attrs = attrs.attributes;
        }
        str = attrs.str;

        if (startsWithSelfClose(str)) {
            str = str.slice(2);
        } else {
            str = str.slice(1);
            lowTagName = lowTagName.replace(/\//, '')
            if (~childlessTags.indexOf(lowTagName)) {
                var end = '</' + tagName + '>';
                var idx = str.indexOf(end);
                if (!~idx) idx = Infinity;
                tag.content = str.slice(0, idx);
                str = str.slice(idx);
            } else if (!~voidTags.indexOf(lowTagName)) {
                var results = parseUntil(str, stack.concat(tagName));
                tag.children = results.nodes;
                str = results.str;
                stack = results.stack;
            }
        }

        return {
            tag: tag,
            str: str,
            stack: stack
        };
    }

    function parseAttrs(str) {
        str = str.trim();
        var results = tagPairs(str, 0);
        str = str.slice(results.cursor);
        var attributes = results.kvs.map(function(pair) {
            var kv = splitHead(pair.trim(), '=');
            kv[1] = kv[1] ? unquote(kv[1]) : "";
            return kv;
        }).reduce(function(attrs, kv) {
            var property = kv[0];
            var value = kv[1];

            attrs[parseOptions.camelCaseAttributes ? camelCase(property) : property] = value ? castValue(value) : "";
            return attrs;
        }, {});
        return {
            str: str,
            attributes: attributes
        };
    }

    function splitHead(str, sep) {
        var idx = str.indexOf(sep);
        if (!~idx) return [str];
        return [str.slice(0, idx), str.slice(idx + sep.length)];
    }

    function tagPairs(str, index) {
        var words = []; // "key", "key=value", "key='value'", etc
        var quote = null; // null, single-, or double-quote
        var cursor = index; // index of parse into str
        var wordBegin = cursor; // index of word start
        var len = str.length;
        while (cursor < len) {
            var char = str.charAt(cursor);
            var isTagEnd = !quote && (char === '/' || char === tagEnd);
            if (isTagEnd) {
                if (cursor !== wordBegin) {
                    words.push(str.slice(wordBegin, cursor));
                }
                break;
            }

            var isWordEnd = !quote && char === ' ';
            if (isWordEnd) {
                if (cursor !== wordBegin) {
                    words.push(str.slice(wordBegin, cursor));
                }
                wordBegin = cursor + 1;
                cursor++;
                continue;
            }

            var isQuoteEnd = char === quote;
            if (isQuoteEnd) {
                quote = null;
                cursor++;
                continue;
            }

            var isQuoteStart = !quote && (char === '\'' || char === '"');
            if (isQuoteStart) {
                quote = char;
                cursor++;
                continue;
            }

            cursor++;
        }

        var attrs = [];
        var wLen = words.length;
        for (var i = 0; i < wLen; i++) {
            var word = words[i];
            if (!(word && word.length)) continue;
            var isNotPair = word.indexOf('=') === -1;
            if (isNotPair) {
                var secondWord = words[i + 1];
                var thirdWord = words[i + 2];
                var isSpacedPair = secondWord === '=' && thirdWord;
                if (isSpacedPair) {
                    var newWord = word + '=' + thirdWord;
                    attrs.push(newWord);
                    i += 2;
                    continue;
                }
            }
            attrs.push(word);
        }

        return {
            cursor: cursor,
            kvs: attrs
        };
    }

    function unquote(str) {
        var car = str.charAt(0);
        var end = str.length - 1;
        if (car === '"' || car === "'" && car === str.charAt(end)) {
            return str.slice(1, end);
        }
        return str;
    }


    function camelCase(str) {
        return str.split('-').reduce(function(str, word) {
            return str + word.charAt(0).toUpperCase() + word.slice(1);
        });
    }

    function castValue(str) {
        if (typeof str !== 'string') return str;
        var num = +str;
        if (!isNaN(num)) return num;
        return str;
    }

    function startsWithCommentStart(s) {
        return (
            s.charAt(0) === '<' &&
            s.charAt(1) === '!' &&
            s.charAt(2) === '-' &&
            s.charAt(3) === '-');
    }

    function startsWithSelfClose(s) {
        return (
            s.charAt(0) === '/' &&
            s.charAt(1) === '>');
    }

    function startsWithDataDash(s) {
        return (
            s.charAt(0) === 'd' &&
            s.charAt(1) === 'a' &&
            s.charAt(2) === 't' &&
            s.charAt(3) === 'a' &&
            s.charAt(4) === '-');
    }

    var himalaya = {
        parse: parse,
        html2json : parse,
        parseTag: parseTag,
        parseUntil: parseUntil,
        parseAttrs: parseAttrs
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = himalaya;
        }
        exports.himalaya = himalaya;
    } else {
        root.himalaya = himalaya;
    }
}).call(this);