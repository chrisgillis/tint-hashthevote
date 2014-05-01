/**
 * Hash the Vote Client
 */

// Use an IIFE to avoid polluting the global namespace
(function(){
	// The hashtags the client is currently subscribed to
	var client_hashtags = [];

	// The array of seen users to prevent cheating. We won't increase
	// the counters if we've seen a vote from that user already.
	var seen_users = [];

	// The structure to hold the hashtag counts
	var hashtag_data = {
		total: 0,
		hashtags: {}
	}; 

	var socket;

	 // Handle the Start Batttle click event
	$('#hashtag-submit').click(function(){
		// Populate client_hashtags
		client_hashtags = $('#hashtag-input').val().toLowerCase().split(",");
		
		// Append the DOM elements used to hold the hashtag counts
		_.each(client_hashtags, function(elm, k){
			// Trim leading and trailing whitespace from the hashtag
			elm = $.trim(elm);

			// Add the hashtag to the list of client hashtags
			client_hashtags[k] = elm;

			// Zero the count structure for the hashtag
			hashtag_data.hashtags[elm] = 0;
		});

		// Once we're done appending, lets keep a list of all of the hashtag <li>
		var $hashtags = $('.hashtags li');

		// Start a new connection
		socket = io.connect();

		// Handle the connection event
		socket.on('connect', function() {
			// Tell the server we want some rooms
			socket.emit('room', client_hashtags.join(","));
		});

		$('div.vote').addClass('hidden');
		$('div.initializing').removeClass('hidden');
		$('p.spinner span').spin('small', '#000');

		// Handle new tweets coming down the pipe
		socket.on('tweet', function(tweet){
			// Ignore tweets from a user we've counted already 
			var user_id = tweet.user.id;
			if(seen_users.indexOf(user_id) !== -1) {
				return; 
			} else {
				seen_users.push(tweet.user.id);
			}

			var text = tweet.text.toLowerCase();
			
			// Increment total tweets received for all subscribed hashtags
			hashtag_data.total++;

			// Increment the individual hashtag count
			_.each(client_hashtags, function(hashtag){
				if(text.indexOf(hashtag) !== -1){
					var count = ++hashtag_data.hashtags[hashtag];
					// Redraw the chart, possible optimization issue here
					StreamResultsChartWidget.draw(hashtag_data.hashtags);
					// Redraw the total
					$('p.total-votes').removeClass('hidden');
					$('p.total-votes span').text(hashtag_data.total);

					$('div.initializing').addClass('hidden');
					$('div.stop-voting').removeClass('hidden');
				}
			});
		});
	});

	$('#stop-voting').click(function(){
		socket.disconnect();
		$(this).addClass('hidden');
	});
})();