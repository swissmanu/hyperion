function neo4jMock() {
	this.cypherQuery = function cypherQuery(statement, parameters, callback) {
		var delay = Math.floor((Math.random() * 500) + 100);

		setTimeout(function() {
			callback(null, {});
		}, delay);
	};

	spyOn(this, 'cypherQuery').and.callThrough();
}

module.exports = neo4jMock;
