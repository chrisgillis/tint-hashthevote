// Draws a d3 powered vertical bar chart
// 	 Possible optimization issues in the future:
// 		* It is redrawn with every new tweet
// 		* It parses hashtag_data on every new tweet
//   Possible Solutions if this implementation gets slow:
//		* See if D3 offers a method of updating itself with ajax data
//		* setInterval() and update every n seconds instead
var StreamResultsChartWidget = {
	settings: {
		width: 500,
		height: 300,
		barMargin: 40,
		$chartWrapper: $('.streamResultsChartWidget')
	},

	clear: function() {
		this.settings.$chartWrapper.empty();
	},

	getData: function(hashtags) {
		// Split the data into two equal length arrays so d3 can understand it
		var labels = [], data = [];
		for(var hashtag in hashtags) {
			labels.push(hashtag);
			data.push(hashtags[hashtag]);
		}
		return {"labels": labels, "data": data};
	},

	draw: function(hashtags) {
		this.clear();

		var chart_data = this.getData(hashtags),
			labels     = chart_data.labels,
			data       = chart_data.data;

		var width  = this.settings.width,
			height = this.settings.height,
			barMargin = this.settings.barMargin;

		// Scale the values linearly
		var y = d3.scale.linear()
			.range([height, barMargin]);

		// Initialize  the chart
		var chart = d3.select(".chart")
			.attr("width", width + barMargin)
			.attr("height", height)
			.append("g")
				.attr("transform", "translate(40,0)");
			
		// Get the max value in data
		y.domain([0, d3.max(data, function(d) { return d; })]);

		// Bar widths should not exceed the chart width
		var barWidth = width / data.length;
		var offsetBarWidth = barWidth - barMargin;

		// Append <g> and transform
		var bar = chart.selectAll("g")
			.data(data)
			.enter().append("g")
				.attr("transform", function(d,i){ return "translate("+i*barWidth+",-"+barMargin+")";});

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
};