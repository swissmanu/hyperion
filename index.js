var q = require('q');

/**
 * The HyperionGraph implements time based graph model proposed by
 * http://www.neo4j.org/graphgist?608bf0701e3306a23e77.
 *
 * @param neo4jDb
 * @constructor
 */
var HyperionGraph = function(neo4jDb, useTransactions) {
	if(useTransactions !== true && useTransactions !== false) {
		useTransactions = true;
	}

	this._db = neo4jDb;
	this._useTransactions = useTransactions;
};

HyperionGraph.prototype.insertNode = function(id, label, data) {
	var nodeLabel = label
		, stateNodeLabel = nodeLabel + 'State'
		, statements = [{
			statement: 'CREATE (node:`' + nodeLabel + '`{nodeProps})-[:STATE{stateRelationshipProps}]->(state:`' + stateNodeLabel + '`{stateNodeProps})'
				, parameters: {
					nodeProps: { id: id }
					, stateRelationshipProps: {
						from: this.time.now()
						, to: this.time.infinity()
					}
					, stateNodeProps: data
				}
			}];

	return this.executeStatements(statements);
};

HyperionGraph.prototype.updateNode = function(id, label, data) {
	var nodeLabel = label
		, stateNodeLabel = nodeLabel + 'State'
		, statements = [{
			statement:	'MATCH (node:`' + nodeLabel + '`{id: {existingNodeProps}.id})-[currentStateRelationship:STATE{to: {stateRelationshipProps}.currentTo}]->(currentState:`' + stateNodeLabel + '`) SET currentStateRelationship.to = {stateRelationshipProps}.newTo ' +
						'CREATE (node)-[newStateRelationship:STATE{from:{stateRelationshipProps}.newTo, to:{stateRelationshipProps}.currentTo}]->(newState:`' + stateNodeLabel + '`) SET newState = currentState SET newState += {newStateProps}'
			, parameters: {
				existingNodeProps: { id: id }
				, stateRelationshipProps: {
					currentTo: this.time.infinity()
					, newTo: this.time.now()
				}
				, newStateProps: data
			}
		}];

	return this.executeStatements(statements);
};

HyperionGraph.prototype.time = {
	/**
	 * Returns the current time in milliseconds.
	 *
	 * @returns {number}
	 */
	now: function() {
		return new Date().getTime();
	}

	/**
	 * Returns the MAX_SAFE_INTEGER. This can be used to indicate that an object is valid until "the end of time".
	 *
	 * @returns {number}
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
	 */
	, infinity: function() {
		return 9007199254740991;
	}
};

/**
 * Executes an array of cypher queries in a transaction. In case of an error, the transaction gets rolled back
 * automatically.
 *
 * @param statements
 * @returns {*}
 */
HyperionGraph.prototype.executeStatementsInTransaction = function(statements) {
	var self = this
		, transactionId;

	return q.ninvoke(this._db, 'beginTransaction')
		.then(function(result) {
			transactionId = result._id;
			return q.ninvoke(self._db, 'addStatementsToTransaction', transactionId, {
				statements: statements
			});
		})
		.then(function() {
			return q.ninvoke(self._db, 'commitTransaction', transactionId);
		})
		.catch(function(err) {
			if(transactionId) {
				q.ninvoke(self._db, 'rollbackTransaction', transactionId);
			}
			throw err;
		});
};

/**
 * Executes an array of cypher queries serially, one after another. See executeStatementsInTransaction for a more
 * fault tolerant way to interact with Neo4j.
 *
 * @param statements
 * @returns {*}
 */
HyperionGraph.prototype.executeStatementsSerially = function(statements) {
	var self = this;

	statements = statements.map(function(statement) {
		return function() {
			var deferred = q.defer();

			self._db.cypherQuery(statement.statement, statement.parameters, function(err, value) {
				if(err) {
					deferred.reject(err);
				} else {
					deferred.resolve(value);
				}
			});

			return deferred.promise;
		};
	});

	return statements.reduce(q.when, q());
};

/**
 * Executes given list of cypher queries. Checks further if queries should be executed as a transaction or just plain
 * serially one after another.
 *
 * @param statements
 * @returns {*}
 */
HyperionGraph.prototype.executeStatements = function(statements) {
	if(this._useTransactions) {
		return this.executeStatementsInTransaction(statements);
	} else {
		return this.executeStatementsSerially(statements);
	}
};

module.exports = HyperionGraph;
