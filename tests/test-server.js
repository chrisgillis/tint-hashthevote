var should = require('should');
var io = require('socket.io-client');

var socketUrl = 'http://localhost:7197';

var options = {
	transports: ['websocket'],
	'force new conncetion': true
};

describe("Server", function(){
	var client = io.connect(socketUrl, options);

	it('should be listening', function(done){
		client.on('connect', function(data){
			done();
		});
	});

	it("should put clients in the requested rooms", function(done){
		client.emit('room', '#room1,#room2');

		client.on('room', function(roomList){
			roomList.should.equal("#room1,#room2");
			done();
		})
	});

	// Need to test that the client can receive tweets
	// Probably need to mock it or we'll exceed the timout (and tests should be fast)
});