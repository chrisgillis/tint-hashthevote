/**
 * Hash the Vote App Server
 */

// Modules
var express    = require('express');
var nconf      = require('nconf');
var bodyParser = require('body-parser');
var Twit       = require('twit');
var _          = require('underscore');

// Express Configuration
var app = express();
app.engine('jade', require('jade').__express); // Templating
app.use(express.static(__dirname + '/public')); // Static directory
app.use(bodyParser()); // Allow parsing of the POST body

// Load configuration file
nconf.file({file: 'config.json'});

// Create a new twitter object with our api key and access token
var twitter = new Twit({
    consumer_key: nconf.get("twitter:consumer_key"),
    consumer_secret: nconf.get("twitter:consumer_secret"),
    access_token: nconf.get("twitter:access_token_key"),
    access_token_secret: nconf.get("twitter:access_token_secret")
});

// Routing
app.get('/', function(req, res) {
    res.render('index.jade');
});

// An array of hashtags that the streaming API will filter for
var hashtags = [];

// Start up the streaming API
var stream = twitter.stream('statuses/filter', { track: hashtags });

// Start listening for requests
var server = app.listen(7197, function() {
    console.log("Listening on port %d", server.address().port);
})

var io = require('socket.io').listen(server)

// Handle socket connections
io.sockets.on('connection', function(socket){
    // Expect clients to want hashtag rooms
    socket.on('room', function(room){
        // Add the requested rooms to the twitter stream
        var rooms = room.split(",");

        // Will be set to true if a room is joined that we're not streaming
        var new_room = false;

        _.each(rooms, function(room){
            // If its a new room, add it to hashtags
            if(hashtags.indexOf(room) === -1) {
                hashtags.push(room);
                new_room = true;
            }
            // Subscribe the socket to the room
            socket.join(room);
        })
        socket.emit('room', room);

        if(new_room) {
            // Re-up the twitter stream to watch the new room
            stream.stop();
            stream.params = {track: hashtags.join(",")};
            stream.start();
        }
    });
});

// When tweets are encountered on the stream
stream.on('tweet', function(tweet){
    // Not sure why this crops up but very rarely this is undefined even though
    // tweet.text contains the hashtag. Would need to dive deeper.
    if(typeof tweet.entities == "undefined" || typeof tweet.entities.hashtags[0] == "undefined"){
        return;
    }
    // Broadcast the tweet to the appropriate hashtag room
    io.sockets.in("#"+tweet.entities.hashtags[0].text.toLowerCase()).emit('tweet', tweet);
});

// Handle socket disconnects
io.sockets.on('disconnect', function(socket) {
    socket.disconnect();
});