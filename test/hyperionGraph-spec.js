var HyperionGraph = require('../');

describe('HyperionGraph', function() {

	beforeEach(function() {
		this.db = require('./mocks/node-neo4j');
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
});
