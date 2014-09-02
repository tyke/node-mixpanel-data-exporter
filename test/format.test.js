var mixpanel_exporter = require('../index')
  , should = require('should')
  , _ = require('underscore')
  , url = require('url')

var mock_request = function(callback) {
    return function(_url, _callback) {
        callback(_url, _callback)
    }
}

describe('Construction', function() {
    it('should throw when no api key is supplied', function() {
        try {
            var obj = new mixpanel_exporter()
        } catch(e) {
            e.message.should.equal('Missing Mixpanel API Key')
        }
    })
    it('should throw when no api secret is supplied', function() {
        try {
            var obj = new mixpanel_exporter({
                api_key: 'api_key'
            })
        } catch(e) {
            e.message.should.equal('Missing Mixpanel API Secret')
        }
    })
    it('should default to json format', function() {
        var obj = new mixpanel_exporter({
            api_key: 'api_key'
          , api_secret: 'api_secret'
        })
        obj.should.have.property('format', 'json')
    })
})
describe('Methods', function() {
    var obj
    beforeEach(function() {
        obj = new mixpanel_exporter({
            api_key: 'api_key'
          , api_secret: 'api_secret'
        })
    })
    describe('Alphabetical Sort', function() {
        it('should alphabetically sort an object', function() {
            JSON.stringify(obj.alphabetical_sort({
                b: 2
              , d: 4
              , a: 1
              , c: 3
            })).should.equal(JSON.stringify({
                a: 1
              , b: 2
              , c: 3
              , d: 4
            }))
        })
        it('should not shuffle an already sorted object', function() {
            JSON.stringify(obj.alphabetical_sort({
                a: 1
              , b: 2
              , c: 3
              , d: 4
            })).should.equal(JSON.stringify({
                a: 1
              , b: 2
              , c: 3
              , d: 4
            }))
        })
        it('should alphabetically sort an object of length 1', function() {
            JSON.stringify(obj.alphabetical_sort({
                b: 2
            })).should.equal(JSON.stringify({
                b: 2
            }))
        })
        it('should alphabetically sort an object of length 0', function() {
            JSON.stringify(obj.alphabetical_sort({})).should.equal(JSON.stringify({}))
        })
    })
    describe('Hash', function() {
        it('should md5 a string', function() {
            var md5 = require('crypto').createHash('md5').update(new Buffer('hash_me').toString('binary')).digest('hex').should.equal(obj.hash('hash_me'))
        })
        it('should md5 a string with utf-8 characters', function() {
            var md5 = require('crypto').createHash('md5').update(new Buffer('®ÀÆæ中さたな').toString('binary')).digest('hex').should.equal(obj.hash('®ÀÆæ中さたな'))
        })
    })
    describe('Signature', function() {
        it('should correctly assemble signature', function() {
            obj.get_signature({
                a: 1
              , b: 2
              , c: 3
            }).should.equal(obj.hash('a=1b=2c=3' + obj.api_secret))
        })
    })
    describe('Generate Args', function() {
        it('should correctly assemble arguments', function() {
            var args = {
                a: 1
              , b: 2
              , expire: 123
            }
            var sorted_args = obj.alphabetical_sort(_.extend({
                api_key: obj.api_key
              , format: obj.format
            }, args))
            var signature = obj.get_signature(sorted_args)
              , parsed_url = _.clone(obj.parsed_url)
            obj.generate_args('events', args).should.equal(url.format(_.extend(parsed_url, {
                pathname: parsed_url.path + 'events'
              , query: _.extend({}, sorted_args, {
                    sig: signature
                })
            })))
        })
        it('should correctly assemble arguments and json encode arrays', function() {
            var args = {
                a: 1
              , b: 2
              , expire: 123
              , c: ['hey']
            }
            var sorted_args = obj.alphabetical_sort(_.extend({
                api_key: obj.api_key
              , format: obj.format
            }, args))
            sorted_args['c'] = JSON.stringify(args.c)
            var signature = obj.get_signature(sorted_args)
              , parsed_url = _.clone(obj.parsed_url)
            obj.generate_args('events', args).should.equal(url.format(_.extend(parsed_url, {
                pathname: parsed_url.path + 'events'
              , query: _.extend({}, sorted_args, {
                    sig: signature
                })
            })))
        })
    })
    describe('Mixpanel API Methods', function() {
        var obj = new mixpanel_exporter({
            api_key: 'api_key'
          , api_secret: 'api_secret'
        })
        _.each(obj.methods, function(method) {
            it('should call Mixpanel\'s "'+method+'" method correctly', function(done) {
                var mp_obj = new mixpanel_exporter({
                    api_key: 'api_key'
                  , api_secret: 'api_secret'
                  , request: mock_request(function(url) {
                        url.should.equal('http://mixpanel.com/api/2.0/'+method+'?a=1&api_key=api_key&b=2&expire=123&format=json&sig=ae12e48e5087f6a871b5ba584a4237e6')
                        done()
                    })
                })
                mp_obj[method.replace('/','_')]({
                    a: 1
                  , expire: 123
                  , b: 2
                })
            })
        })
    })
})
describe('Request', function() {
    it('should error when an error is thrown', function(done) {
        var obj = new mixpanel_exporter({
            api_key: 'api_key'
          , api_secret: 'api_secret'
          , request: mock_request(function(url, callback) {
                callback(new Error('request error'))
            })
        })
        obj.events({}, function(error, request) {
            should.not.exist(request)
            error.message.should.equal('request error')
            done()
        })
    })
    it('should return request and body from the actual request object', function(done) {
        var obj = new mixpanel_exporter({
            api_key: 'api_key'
          , api_secret: 'api_secret'
          , request: mock_request(function(url, callback) {
                callback(null, 'request', 'body')
            })
        })
        obj.events({}, function(error, request, body) {
            should.not.exist(error)
            request.should.equal('request')
            body.should.equal('body')
            done()
        })
    })
})
