/**
 * Hash the Vote Client
 */

// Use an IIFE to avoid polluting the global namespace
(function(){

	var HtvClient = function(options) {
		var self = this;

		// The array of seen users to prevent cheating. We won't increase
		// the counters if we've seen a vote from that user already.
		self.seen_users = [];

		// The structure to hold the hashtag counts
		self.hashtag_data = {
			total: 0,
			hashtags: {}
		}; 

		// The array of subscribed hashtags
		self.hashtags = options.hashtags || [];

		// Trim the provided hashtags and zero their count
		_.each(self.hashtags, function(hashtag, k){
			hashtag = $.trim(hashtag);
			self.hashtags[k] = hashtag;
			self.hashtag_data.hashtags[hashtag] = 0;
		});

		self.connect = function() {
			self.socket = io.connect();
			self.setEventListeners(self.socket);
		};

		self.disconnect = function() {
			self.socket.disconnect();
		};

		self.setEventListeners = function(socket) {
			// Handle the connection event
			socket.on('connect', function() {
				// Tell the server we want some rooms
				socket.emit('room', self.hashtags.join(","));
			});

			// Handle new tweets coming down the pipe
			socket.on('tweet', function(tweet){
				// Ignore tweets from a user we've counted already 
				var user_id = tweet.user.id;
				if(self.seen_users.indexOf(user_id) !== -1) {
					return; 
				} else {
					self.seen_users.push(tweet.user.id);
				}

				var text = tweet.text.toLowerCase();
				
				// Increment total tweets received for all subscribed hashtags
				self.hashtag_data.total++;

				// Increment the individual hashtag count
				_.each(self.hashtags, function(hashtag){
					if(text.indexOf(hashtag) !== -1){
						var count = ++self.hashtag_data.hashtags[hashtag];
						// Redraw the chart, possible optimization issue here
						StreamResultsChartWidget.draw(self.hashtag_data.hashtags);
						// Redraw the total
						$('p.total-votes').removeClass('hidden');
						$('p.total-votes span').text(self.hashtag_data.total);

						$('div.initializing').addClass('hidden');
						$('div.stop-voting').removeClass('hidden');
					}
				});
			});
		};
	};


	var client;

	 // Handle the Start Batttle click event
	$('#hashtag-submit').click(function(){
		// Once we're done appending, lets keep a list of all of the hashtag <li>
		var $hashtags = $('.hashtags li');

		// Make a new client and connect
		client = new HtvClient({hashtags: $('#hashtag-input').val().toLowerCase().split(",")});
		client.connect();

		$('div.vote').addClass('hidden');
		$('div.initializing').removeClass('hidden');
		$('p.spinner span').spin('small', '#000');
	});

	$('#stop-voting').click(function(){
		client.disconnect();
		$(this).addClass('hidden');
	});

})();