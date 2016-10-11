let build = require(__dirname + "/../build/commonjs/index.js");
var Parser = build.HTMLParser;
var should = require('should');
describe('HTMLparser', function() {

    /* */
    it('Should parse one tag', function() {

        var data = Parser.parse('<div id="test"></div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "id": "test"
            },
            "name": "div",
            "children": []
        }])

    });

    it('Should parse one tag with text', function() {

        var data = Parser.parse('<div id="test">hello world</div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "id": "test"
            },
            "name": "div",
            "children": [{
                type: "text",
                value: "hello world"
            }]
        }]);
    });
    it('Should parse one tag with text and a tag', function() {

        var data = Parser.parse('<div id="test">hello world<strong>bold text</strong></div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "id": "test"
            },
            "name": "div",
            "children": [{
                type: "text",
                value: "hello world"
            }, {
                type: "tag",
                name: "strong",
                children: [{
                    type: "text",
                    value: "bold text"
                }]
            }]
        }]);

    });

    it('Should parse attributes', function() {

        var data = Parser.parse('<div id="test" enabled other_tag></div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "id": "test",
                "enabled": "",
                "other_tag": ""
            },
            "name": "div",
            "children": []
        }])

    });

    it('Should autoclose br', function() {

        var data = Parser.parse('<br><div>hello</div>', true);

        data.should.deepEqual([{
            "type": "tag",
            "name": "br"
        }, {
            "type": "tag",
            "name": "div",
            "children": [{
                "type": "text",
                "value": "hello"

            }]
        }]);
    });

    it('Should be okay with properly closed br', function() {

        var data = Parser.parse('<br/><div>hello</div>', true);

        data.should.deepEqual([{
            "type": "tag",
            "name": "br"
        }, {
            "type": "tag",
            "name": "div",
            "children": [{
                "type": "text",
                "value": "hello"

            }]
        }]);
    });

    it('Should autoclose input', function() {

        var data = Parser.parse('<input type="text">hello', true);
        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "type": "text"
            },
            "name": "input"
        }, {
            "type": "text",
            "value": "hello"
        }])
    });

    it('Should autoclose br', function() {

        var data = Parser.parse('<br>hello', true);
        //console.log(JSON.stringify(data, 2, 2))
        data.should.deepEqual([{
            "type": "tag",
            "name": "br"
        }, {
            "type": "text",
            "value": "hello"
        }])
    });

    it('Should autoclose hr', function() {

        var data = Parser.parse('<hr>hello', true);
        //console.log(JSON.stringify(data, 2, 2))
        data.should.deepEqual([{
            "type": "tag",
            "name": "hr"
        }, {
            "type": "text",
            "value": "hello"
        }])
    });

    it('Should ignore explicit closing on autoclosing tag', function() {

        var data = Parser.parse('<input></input><br>hello', true);
        //      console.log(JSON.stringify(data, 2, 2))
        data.should.deepEqual([{
            "type": "tag",
            "name": "input"
        }, {
            "type": "tag",
            "name": "br"
        }, {
            "type": "text",

            "value": "hello"
        }])

    });

    it('Should parse attributes correctly', function() {

        var data = Parser.parse('<a ws-link="/user/profile"></a>', true);
        data.should.deepEqual([{
            type: 'tag',
            attrs: {
                'ws-link': '/user/profile'
            },
            name: 'a',
            children: []
        }])

    });
    it('Should parse comments', function() {

        var data = Parser.parse('<div><!--my comment--></div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "name": "div",
            "children": [{
                "type": "comment",
                "value": "my comment"
            }]
        }]);
    });

    it('Should parse comments (2) ', function() {

        var data = Parser.parse('<div><!-- my-comment --></div>', true);
        data.should.deepEqual([{
            "type": "tag",
            "name": "div",
            "children": [{
                "type": "comment",
                "value": " my-comment "
            }]
        }]);
    });



    it('Should parse html and comments ', function() {

        var data = Parser.parse('<div id="restore"><root data-test style="flot: left; background: red;">first text node<!--comment--><h1 >a</h1><component >b</component></root></div>', true);
        // console.log(data);

        data.should.deepEqual([{
            "type": "tag",
            "attrs": {
                "id": "restore"
            },
            "name": "div",
            "children": [{
                "type": "tag",
                "attrs": {
                    "data-test": "",
                    "style": "flot: left; background: red;"
                },
                "name": "root",
                "children": [{
                        "type": "text",
                        "value": "first text node"
                    },
                    {
                        "type": "comment",
                        "value": "comment"
                    },
                    {
                        "type": "tag",
                        "name": "h1",
                        "children": [{
                            "type": "text",
                            "value": "a"
                        }]
                    },
                    {
                        "type": "tag",
                        "name": "component",
                        "children": [{
                            "type": "text",
                            "value": "b"
                        }]
                    }
                ]
            }]
        }])

    });


    it('Should parse root textNodes and comments ', function() {

        var data = Parser.parse('<!-- my-comment --> hello world<div>inner</div>', false);
        //console.log(data);
        // console.log(JSON.stringify(data, 2, 2));
    });



});