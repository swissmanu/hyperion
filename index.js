var q = require('q');

/**
 * Executes an array of cypher queries in a transaction. In case of an error, the transaction gets rolled back
 * automatically.
 *
 * @param statements
 * @returns {*}
 */
function executeStatementsInTransaction(statements) {
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
}

/**
 * Executes an array of cypher queries serially, one after another. See executeStatementsInTransaction for a more
 * fault tolerant way to interact with Neo4j.
 *
 * @param statements
 * @returns {*}
 */
function executeStatementsSerially(statements) {
	var self = this;

	statements = statements.map(function(statement) {
		return q.nbind(self._db.cypherQuery, self._db, statement.statement, statement.parameters);
	});

	return statements.reduce(q.when, q());
}

/**
 * Executes given list of cypher queries. Checks further if queries should be executed as a transaction or just plain
 * serially one after another.
 *
 * @param statements
 * @returns {*}
 */
function executeStatements(statements) {
	if(this._useTransactions && statements.length > 1) {
		return executeStatementsInTransaction.call(this, statements);
	} else {
		return executeStatementsSerially.call(this, statements);
	}
}

function now() {
	return new Date().getTime();
}

function infinity() {
	// MAX_SAFE_INTEGER:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
	return 9007199254740991;
}


/**
 * The HyperionGraph implements time based graph model proposed by
 * http://www.neo4j.org/graphgist?608bf0701e3306a23e77.
 *
 * @param neo4jDb
 * @constructor
 */
var HyperionGraph = function(neo4jDb) {
	this._db = neo4jDb;
	this._useTransactions = true;  // TODO expose in future :)
};

HyperionGraph.prototype.insertNode = function(id, label, data) {
	var nodeLabel = label
		, stateNodeLabel = nodeLabel + 'State'
		, statements = [{
			statement: 'CREATE (node:`' + nodeLabel + '`{nodeProps})-[:STATE{stateRelationshipProps}]->(state:`' + stateNodeLabel + '`{stateNodeProps})'
				, parameters: {
					nodeProps: { id: id }
					, stateRelationshipProps: {
						from: now()
						, to: infinity()
					}
					, stateNodeProps: data
				}
			}];

	return executeStatements.call(this, statements);
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
					currentTo: infinity()
					, newTo: now()
				}
				, newStateProps: data
			}
		}];

	return executeStatements.call(this, statements);
};


module.exports = HyperionGraph;
