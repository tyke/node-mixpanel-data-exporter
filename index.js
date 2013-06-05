var crypto = require('crypto')
  , url = require('url')
  , _ = require('underscore')
  , mixpanel_methods = [
        'events'
      , 'events/top'
      , 'events/names'
      , 'events/properties'
      , 'events/properties/top'
      , 'events/properties/values'
      , 'funnels'
      , 'funnels/list'
      , 'segmentation'
      , 'segmentation/numeric'
      , 'segmentation/sum'
      , 'segmentation/average'
      , 'retention'
      , 'engage'
    ]

var mixpanel_exporter = function(args) {
    _.extend(this, {
        parsed_url: url.parse('http://mixpanel.com/api/2.0/', true)
      , format: 'json'
      , methods: mixpanel_methods
      , request: require('request')
    }, args)

    if(!this.api_key) throw new Error('Missing Mixpanel API Key')
    if(!this.api_secret) throw new Error('Missing Mixpanel API Secret')
}
mixpanel_exporter.prototype.alphabetical_sort = function(obj) {
    return _.reduce(_.keys(obj).sort(), function(sorted, el) {
        sorted[el] = obj[el]
        return sorted
    }, {})
}
mixpanel_exporter.prototype.hash = function(string) {
    return crypto.createHash('md5').update(string).digest('hex')
}
mixpanel_exporter.prototype.get_signature = function(obj) {
    return this.hash(_.reduce(obj, function(sig, val, key) {
        sig += key + '=' + (obj[key])
        return sig
    }, '') + this.api_secret)
}
mixpanel_exporter.prototype.stringify_array = function(obj) {
    return _.reduce(obj, function(stringified, val, key) {
        if(_.isArray(val)) {
            val = JSON.stringify(val)
        }
        stringified[key] = val
        return stringified
    }, {})
}
mixpanel_exporter.prototype.generate_args = function(endpoint, _args) {
    var args = this.stringify_array(_.extend({
        api_key: this.api_key
      , expire: Date.now() + 1000
      , format: this.format
    }, _args))

    var sorted_args = this.alphabetical_sort(args)
      , signature = this.get_signature(sorted_args)
      , parsed_url = _.clone(this.parsed_url)

    return url.format(_.extend(parsed_url, {
        pathname: parsed_url.path += endpoint
      , query: _.extend({}, sorted_args, {
            sig: signature
        })
    }))
}
mixpanel_exporter.prototype.fetch = function(endpoint, args, callback) {
    this.request(this.generate_args(endpoint, args), function(error, response, body) {
        if(error) return callback(error)
        callback(null, response, body)
    })
}
_.each(mixpanel_methods, function(method) {
    mixpanel_exporter.prototype[method.replace('/', '_')] = function(args, callback) {
        this.fetch(method, args, callback)
    }
})

module.exports = mixpanel_exporter
