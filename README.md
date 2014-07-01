node-mixpanel-data-exporter
=============

This provides a wrapper to Mixpanel's [Data Export API](https://mixpanel.com/docs/api-documentation/data-export-api)

Install
-------
<pre>
npm install node-mixpanel-data-exporter
</pre>

Quick Start
-----------
Initialize
<pre>
  //initialize with required api_key and api_secret
  var Mixpanel_Exporter = require('node-mixpanel-data-exporter')
    , mixpanel_exporter = new Mixpanel_Exporter({
          api_key: 'your api key'
        , api_secret: 'your api secret'
        , format: 'json' //optional and will default to json
      })
</pre>
Request to any of the [API Methods](https://mixpanel.com/docs/api-documentation/data-export-api#top-endpoints)
<pre>
  mixpanel_exporter.fetch('events', {
      event: ['your event name']
    , type: 'general'
    , unit: 'minute'
    ...
  }, function(error, request, body) {

  })
</pre>
If the API Method has a path, use the full path
<pre>
  mixpanel_exporter.fetch('events/top', {
      type: 'general'
      ...
  }, function(error, request, body) {
    
  })
</pre>
You can also call any of the methods directly
<pre>
  mixpanel_exporter.events({
      event: ['your event name']
    , type: 'general'
    , unit: 'minute'
    ...
  }, function(error, request, body) {
  
  })
</pre>
If the method has a forward slash, replace it with an underscore
<pre>
  mixpanel_exporter.events_top({
      type: 'general'
      ...
  }, function(error, request, body) {
  
  })
</pre>

Tests
-----
<pre>
  make
</pre>
