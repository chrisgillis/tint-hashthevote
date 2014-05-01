# Hash the Vote

## Installation

Hash the Vote requires `npm` and `nodejs`. If your system has named the nodejs binary `node` instead, you will need to modify the `start` script in `package.json`.

```
git clone http://github.com/chrisgillis/tint-hashthevote
cd tint-hashthevote
vim config.json
npm start

visit http://localhost:7197 in your browser. Did you get the leet speak?
```

### Architecture

Hash the Vote uses a thin Node.js server that uses socket.io to create channels for each hashtag it is watching. Clients can connect and subscribe to rooms to receive the tweets on those channels.

Counting and cheat detection is client-side.

### Unit Tests

Unit tests are located in `tests/`. You can run them with `mocha`.

### Considerations

* A presentation layer framework like React might be used in the future for the 
  data-bound components in the view. I've kept it pretty simple at the moment.

* A logging mechanism should be implemented before production use.


### User Stories for Enhancements

* Users can save their voting results to the database
* Users can view a barchart that shows votes over time for each hashtag
* Users can see the geographical locations that get the most votes
* Users can see live reporting metrics during the voting session
* Users can see run an analytics report with detailed metrics after the voting session

### Analytics Opportunities

 * __Geographical Location__: Clients would be able to see how users from certain countries vote differently.
 * __Sub Hash Tags__: It's likely that users will include other hashtags in their vote post, which may help identify future hashtags for marketing potential
 * __Retweets__: It would be possible to track retweets of votes, to see what the most popular opinions are that other voters identify with.
 * __Favorites__: The highest favorited votes would be useful for the same reason as Retweets.
 * __Languages__: Seeing the quantity of votes per user language could be useful in determining what demographics you are reaching out to.
 * __URLs__: We can display what URL's users were including with their vote. Perhaps there are significant bloggers that are influencing the vote.
 * __Time vs Volume__: We could report on Time vs Volume showing what periods had the highest voting volume
