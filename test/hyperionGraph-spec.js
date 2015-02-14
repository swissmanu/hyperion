var HyperionGraph = require('../');

describe('HyperionGraph', function() {

	beforeEach(function() {
		this.db = new require('./mocks/node-neo4j');
	});

	describe('Constructor', function () {
		describe('db parameter', function() {
			it('should be kept as _db internally', function() {
				var fakeDb = 'leia'
					, hyperion = new HyperionGraph(fakeDb);

				expect(hyperion._db).toEqual(fakeDb);
			});
		});

		describe('useTransactions parameter', function() {
			it('should be defaulted with true if not given', function() {
				var hyperion = new HyperionGraph({});
				expect(hyperion._useTransactions).toEqual(true);
			});

			it('should be defaulted with true if not given as boolean', function() {
				var useTransactions = 'luke'
					, hyperion = new HyperionGraph({}, useTransactions);

				expect(hyperion._useTransactions).toEqual(true);
			});

			it('should be kept as _useTransactions internally', function() {
				var hyperion = new HyperionGraph({}, false);
				expect(hyperion._useTransactions).toEqual(false);
			});
		});
	});



	describe('time', function() {
		beforeEach(function() {
			this.hyperion = new HyperionGraph(this.db);
		});

		describe('now()', function () {
			it('should return the current time in milliseconds', function() {
				var fakeCurrentTime = 'chewie';

				global.Date = function() {
					this.getTime = function() {
						return fakeCurrentTime;
					};
				};

				expect(this.hyperion.time.now()).toEqual(fakeCurrentTime);
			})
		});

		describe('infinity()', function() {
			it('should return MAX_SAFE_INTEGER', function () {
				expect(this.hyperion.time.infinity()).toEqual(9007199254740991);
			});
		});
	});


	describe('executeStatements()', function() {
		beforeEach(function() {
			this.statements = [{ mighty: true }, { name: 'yoda' }];
		});

		describe('having transactions turned off', function() {
			beforeEach(function() {
				this.hyperion = new HyperionGraph(this.db, false);
				spyOn(this.hyperion, 'executeStatementsSerially');
			});

			it('should call executeStatementsSerially()', function() {
				this.hyperion.executeStatements(this.statements);
				expect(this.hyperion.executeStatementsSerially).toHaveBeenCalledWith(this.statements);
			});

			it('should return executeStatementsSerially()s return value', function () {
				this.hyperion.executeStatementsSerially.andReturn('luke');
				expect(this.hyperion.executeStatements(this.statements)).toEqual('luke');
			});
		});

		describe('having transactions turned on', function() {
			beforeEach(function() {
				this.hyperion = new HyperionGraph(this.db, true);
				spyOn(this.hyperion, 'executeStatementsInTransaction');
			});

			it('should call executeStatementsInTransaction()', function() {
				this.hyperion.executeStatements(this.statements);
				expect(this.hyperion.executeStatementsInTransaction).toHaveBeenCalledWith(this.statements);
			});

			it('should return executeStatementsInTransaction()s return value', function () {
				this.hyperion.executeStatementsInTransaction.andReturn('vader');
				expect(this.hyperion.executeStatements(this.statements)).toEqual('vader');
			});
		});
	});


	/*
	describe('executeStatementsSerially()', function() {
		it('should pass given statements to the node-neo4j\'s cypherQuery() function in present order', function(done) {
			var statements = [
				{ statement: '1', parameters: {} }
				, { statement: '2', parameters: {} }
				, { statement: '3', parameters: {} }
			];

			this.hyperion = new HyperionGraph(this.db);

			this.hyperion.executeStatementsSerially(statements)
				.then(function() {
					console.log('ok');
					done();
				})
				.catch(function(err) {
					console.log(err);
					throw err;
				});
		});
	});
	*/
});
