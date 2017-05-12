import SuperWorkers from '../src/index';

describe('SuperWorkers', () => {
	describe('Basic tests', () => {
		it('verify it is defined and its methods', () => {
			expect(SuperWorkers).toBeDefined();
			expect(SuperWorkers.MainThread).toBeDefined();
			expect(SuperWorkers.WorkerThread).toBeDefined();
			expect(SuperWorkers.Promise).toBeDefined();
		});
	});
});
