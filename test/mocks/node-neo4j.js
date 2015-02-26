function neo4jMock() {
	var self = this;

	self.transactionId = 42;
	self.recordedCalls = [];
	self.letBeginTransactionFail = false;
	self.letAddStatementsToTransactionFail = false;
	self.letCommitTransactionFail = false;

	function recordCall(functionName, arguments) {
		self.recordedCalls.push({
			name: functionName
			, arguments: Array.prototype.slice.call(arguments)
		});
	}

	this.cypherQuery = function cypherQuery(statement, parameters, callback) {
		var delay = Math.floor((Math.random() * 500) + 100);

		recordCall('cypherQuery', arguments);

		setTimeout(function() {
			callback(null, {});
		}, delay);
	};

	this.beginTransaction = function(callback) {
		recordCall('beginTransaction', arguments);

		setTimeout(function() {
			if(self.letBeginTransactionFail) {
				callback(new Error('failed'), {});
			} else {
				callback(null, {
					_id: self.transactionId
				});
			}
		}, 100);
	};

	this.addStatementsToTransaction = function(transactionId, parameters, callback) {
		recordCall('addStatementsToTransaction', arguments);

		setTimeout(function() {
			if(self.letAddStatementsToTransactionFail) {
				callback(new Error('failed'), {});
			} else {
				callback(null, {});
			}
		}, 100);
	};

	this.commitTransaction = function(transactionid, callback) {
		recordCall('commitTransaction', arguments);

		setTimeout(function() {
			if(self.letCommitTransactionFail) {
				callback(new Error('failed'), {});
			} else {
				callback(null, {});
			}
		}, 100);
	}

	this.rollbackTransaction = function(transactionid, callback) {
		recordCall('rollbackTransaction', arguments);

		setTimeout(function() {
			callback(null, {});
		}, 100);
	}

	spyOn(this, 'cypherQuery').and.callThrough();
	spyOn(this, 'beginTransaction').and.callThrough();
	spyOn(this, 'addStatementsToTransaction').and.callThrough();
	spyOn(this, 'commitTransaction').and.callThrough();
	spyOn(this, 'rollbackTransaction').and.callThrough();
}

module.exports = neo4jMock;
