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
		var socket = io.connect();

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
					renderChart();
					// Redraw the total
					$('p.total-votes').removeClass('hidden');
					$('p.total-votes span').text(hashtag_data.total);

					$('div.initializing').addClass('hidden');
				}
			});
		});
	});

	// Draws a d3 powered vertical bar chart
	// 	 Possible optimization issues in the future:
	// 		* It is redrawn with every new tweet
	// 		* It parses hashtag_data on every new tweet
	//   Possible Solutions if this implementation gets slow:
	//		* See if D3 offers a method of updating itself with ajax data
	//		* setInterval() and update every n seconds instead
	function renderChart() {
		$(".chart").empty();

		// Split the data into two equal length arrays so d3 can understand it
		var labels = [], data = [];
		for(var hashtag in hashtag_data.hashtags) {
			labels.push(hashtag);
			data.push(hashtag_data.hashtags[hashtag]);
		}

		// Set the maximum width and height
		var width = 500, height = 300, barWidthOffset = 40;

		// Scale the values linearly
		var y = d3.scale.linear()
			.range([height, 40]);

		// Initialize  the chart
		var chart = d3.select(".chart")
			.attr("width", width)
			.attr("height", height);
			
		// Get the max value in data
		y.domain([0, d3.max(data, function(d) { return d; })]);

		// Bar widths should not exceed the chart width
		var barWidth = width / data.length;
		var offsetBarWidth = barWidth - 40;

		// Append <g> and transform
		var bar = chart.selectAll("g")
			.data(data)
			.enter().append("g")
				.attr("transform", function(d,i){ return "translate("+i*barWidth+",-40)";});

		// Add rects
		bar.append("rect")
			.attr("y", function(d) { return y(d); })
			.attr("height", function(d) { return height - y(d); })
			.attr("width", offsetBarWidth);

		// Add text to bar
		bar.append("text")
			.attr("y", function(d) { return y(d) + 3; })
			.attr("x", offsetBarWidth/2)
			.attr("dy", "1.5em")
			.attr("class", "numTweets")
			.text(function(d) { return d; });

		// Add the labels
		chart.selectAll("text.yAxis")
			.data(labels)
			.enter().append("svg:text")
			.attr("x", function(d,i) { return (i*barWidth) + (offsetBarWidth/2); })
			.attr("y", height)
			.attr("transform", "translate(0,-18)")
			.attr("class", "hashtags")
			.text(function(d) { return d; });

		// Highlight the bar with the current highest value
		var max = d3.max(data, function(d) { return d; });
		chart.selectAll("rect")
			.filter(function(d) { return d === max; })
			.classed("max", true);
	}
})();