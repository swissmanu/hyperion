module.exports = {
	lastDelay: 300
	, cypherQuery: function(statement, parameters, callback) {
		this.lastDelay -= 50;

		console.log('called', statement, parameters);

		setTimeout(function() {
			callback();
		}, this.lastDelay);
	}
};
