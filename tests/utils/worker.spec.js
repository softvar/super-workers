import WorkerUtils from '../../src/utils/worker';

import ArrayUtils from '../../src/utils/array';
import GeneralUtils from '../../src/utils/generalUtils';
import WarningTextEnum from '../../src/enums/WarningTextEnum';
import WorkerStatusEnum from '../../src/enums/WorkerStatusEnum';

function addWorker(id, status) {
	let worker = {
		id: id || 1,
		worker: {
			terminate: function () {}
		},
		status: status || WorkerStatusEnum.IDLE
	};

	return worker;
}

describe('WorkerUtils', () => {
	beforeEach(() => {
		WorkerUtils.workers = [];
		WorkerUtils.config = {};
	});

	describe('Basic Tests', () => {
		it('should verify it is defined', () => {
			expect(WorkerUtils).toBeDefined();
		});
	});

	describe('constructor', () => {
		it('should set default properties on object created', () => {
			expect(WorkerUtils.workers).toBeDefined();
			expect(WorkerUtils.workers.length).toBe(0);
			expect(WorkerUtils.config).toEqual({});

			expect(WorkerUtils._isWebWorkerSupported).toBeDefined();
			expect(WorkerUtils._remove).toBeDefined();
			expect(WorkerUtils.addNew).toBeDefined();
			expect(WorkerUtils.getIdle).toBeDefined();
			expect(WorkerUtils.getTerminated).toBeDefined();
			expect(WorkerUtils.getAll).toBeDefined();
			expect(WorkerUtils.terminate).toBeDefined();
			expect(WorkerUtils.terminateAllExceptOne).toBeDefined();
			expect(WorkerUtils.terminateAll).toBeDefined();
			expect(WorkerUtils.broadCastAll).toBeDefined();
			expect(WorkerUtils.broadCastTo).toBeDefined();
			expect(WorkerUtils.sendMessage).toBeDefined();
		});
	});

	describe('method: _isWebWorkerSupported', () => {
		it('should return true if its defined as a function', () => {
			expect(WorkerUtils._isWebWorkerSupported()).toBe(true);
		});
	});

	describe('method: _remove', () => {
		it('should remove a worker from the list', () => {
			spyOn(ArrayUtils, 'searchByKeyName');
			spyOn(WorkerUtils.workers, 'splice');

			WorkerUtils.addNew(addWorker(1));
			WorkerUtils.addNew(addWorker(2));

			WorkerUtils._remove(WorkerUtils.workers[0]);
			expect(ArrayUtils.searchByKeyName).toHaveBeenCalledWith(WorkerUtils.workers, 'id', 1, 'index');
			expect(WorkerUtils.workers.splice).toHaveBeenCalled();
		});
	});

	describe('method: addNew', () => {
		it('should add workers to the list of workers', () => {
			spyOn(WorkerUtils.workers, 'push');
			let worker = addWorker(1);

			WorkerUtils.addNew(worker);
			expect(WorkerUtils.workers.push).toHaveBeenCalledWith(worker);
		});
	});

	describe('method: getActive', () => {
		it('get only the active workers from the list of all workers', () => {
			WorkerUtils.addNew(addWorker(1));
			WorkerUtils.addNew(addWorker(2, WorkerStatusEnum.ACTIVE));
			WorkerUtils.addNew(addWorker(3));

			expect(WorkerUtils.getActive().length).toBe(1);
		});
	});

	describe('method: getIdle', () => {
		it('get only the idle workers from the list of all workers', () => {
			WorkerUtils.addNew(addWorker(1));
			WorkerUtils.addNew(addWorker(2, WorkerStatusEnum.ACTIVE));
			WorkerUtils.addNew(addWorker(3));

			expect(WorkerUtils.getIdle().length).toBe(2);
		});
	});

	describe('method: getTerminated', () => {
		it('get only the terminated workers from the list of all workers', () => {
			WorkerUtils.addNew(addWorker(1));
			WorkerUtils.addNew(addWorker(2, WorkerStatusEnum.TERMINATED));
			WorkerUtils.addNew(addWorker(3));

			expect(WorkerUtils.getTerminated().length).toBe(1);
		});
	});

	describe('method: getAll', () => {
		it('get all the workers from the list', () => {
			WorkerUtils.addNew(addWorker(1));
			WorkerUtils.addNew(addWorker(2));
			WorkerUtils.addNew(addWorker(3, WorkerStatusEnum.TERMINATED));
			WorkerUtils.addNew(addWorker(4, WorkerStatusEnum.TERMINATED));

			expect(WorkerUtils.getAll().length).toBe(4);
		});
	});

	describe('method: terminate', () => {
		it('warn if no id is present', () => {
			spyOn(console, 'warn');
			WorkerUtils.terminate();
			expect(console.warn).toHaveBeenCalledWith(WarningTextEnum.NO_ID_PROVIDED);
		});
		it('should find the worker with the id provided', () => {
			spyOn(ArrayUtils, 'searchByKeyName');
			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.TERMINATED));

			WorkerUtils.terminate(1);

			expect(ArrayUtils.searchByKeyName).toHaveBeenCalledWith(WorkerUtils.workers, 'id', 1, 'object');
		});
		it('should warn if worker is already terinated', () => {
			spyOn(console, 'warn');
			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.TERMINATED));

			WorkerUtils.terminate(1);

			expect(console.warn).toHaveBeenCalledWith(WarningTextEnum.WORKER_ALREADY_TERMINATED);
		});
		it('should termiate the worker', () => {
			let worker = addWorker(1, WorkerStatusEnum.ACTIVE);

			WorkerUtils.addNew(worker);
			spyOn(worker.worker, 'terminate');

			WorkerUtils.terminate(1);

			expect(worker.worker.terminate).toHaveBeenCalled();
			expect(worker.status).toEqual(WorkerStatusEnum.TERMINATED);
		});
	});

	describe('method: terminateAllExceptOne', () => {
		it('should call terminateAll with params', () => {
			spyOn(WorkerUtils, 'terminateAll');
			WorkerUtils.terminateAllExceptOne(1);
			expect(WorkerUtils.terminateAll).toHaveBeenCalledWith(true, 1)
		});
	});

	describe('method: terminateAll', () => {
		it('should include active+idle as non-terminated workers when no exceptOne flag is passed', () => {
			spyOn(WorkerUtils, 'getActive');
			spyOn(WorkerUtils, 'getIdle');

			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.ACTIVE));
			WorkerUtils.addNew(addWorker(2, WorkerStatusEnum.IDLE));

			WorkerUtils.terminateAll();

			expect(WorkerUtils.getActive).toHaveBeenCalled();
			expect(WorkerUtils.getIdle).toHaveBeenCalled();
		});
		it('should include only idle as non-terminated workers when exceptOne flag is passed', () => {
			spyOn(WorkerUtils, 'getActive');
			spyOn(WorkerUtils, 'getIdle');

			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.ACTIVE));
			WorkerUtils.addNew(addWorker(2, WorkerStatusEnum.IDLE));

			WorkerUtils.terminateAll(true, 1);

			expect(WorkerUtils.getActive).not.toHaveBeenCalled();
			expect(WorkerUtils.getIdle).toHaveBeenCalled();
		});
		it('should terminate desired workers', () => {
			let worker1 = addWorker(1, WorkerStatusEnum.ACTIVE),
				worker2 = addWorker(2, WorkerStatusEnum.IDLE);

			expect(worker1.status).toEqual(WorkerStatusEnum.ACTIVE);
			expect(worker2.status).toEqual(WorkerStatusEnum.IDLE);

			spyOn(worker1.worker, 'terminate');
			spyOn(worker2.worker, 'terminate');

			WorkerUtils.addNew(worker1);
			WorkerUtils.addNew(worker2);

			WorkerUtils.terminateAll();

			expect(worker1.worker.terminate).toHaveBeenCalled();
			expect(worker2.worker.terminate).toHaveBeenCalled();

			expect(worker1.status).toEqual(WorkerStatusEnum.TERMINATED);
			expect(worker2.status).toEqual(WorkerStatusEnum.TERMINATED);
		});
	});

	describe('method: broadCastAll', () => {
		it('should get Active workers', () => {
			spyOn(WorkerUtils, 'getActive');
			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.ACTIVE));
			WorkerUtils.broadCastAll({});
			expect(WorkerUtils.getActive).toHaveBeenCalled();
		})
		it('should call sendMessage of all workers', () => {
			let worker1 = addWorker(1, WorkerStatusEnum.ACTIVE);

			spyOn(WorkerUtils, 'sendMessage');
			WorkerUtils.addNew(worker1);

			WorkerUtils.broadCastAll({});
			expect(WorkerUtils.sendMessage).toHaveBeenCalled();
		});
	});

	describe('method: broadCastTo', () => {
		it('should get all the workers', () => {
			spyOn(WorkerUtils, 'getIdle');
			spyOn(WorkerUtils, 'getActive');

			WorkerUtils.addNew(addWorker(1, WorkerStatusEnum.ACTIVE));

			WorkerUtils.broadCastTo({});

			expect(WorkerUtils.getActive).toHaveBeenCalled();
			expect(WorkerUtils.getIdle).toHaveBeenCalled();
		})
		it('should find the worker to send', () => {
			let worker1 = addWorker(1, WorkerStatusEnum.ACTIVE);

			spyOn(ArrayUtils, 'searchByKeyName');
			WorkerUtils.addNew(worker1);

			WorkerUtils.broadCastTo(1, {});
			expect(ArrayUtils.searchByKeyName).toHaveBeenCalled();
		});
		it('should send the message', () => {
			let worker1 = addWorker(1, WorkerStatusEnum.ACTIVE);

			spyOn(WorkerUtils, 'sendMessage');
			WorkerUtils.addNew(worker1);

			WorkerUtils.broadCastTo(1, {});
			expect(WorkerUtils.sendMessage).toHaveBeenCalledWith(worker1, {});
		});
	});


	describe('method: sendMessage', () => {
		it('serializeFunction if config method is of function type', () => {
			let worker1 = new Worker('test.js');

			spyOn(GeneralUtils, 'serializeFunction');
			WorkerUtils.sendMessage(worker1, {
				method: function () {},
				origin: '*'
			});

			expect(GeneralUtils.serializeFunction).toHaveBeenCalledWith(jasmine.any(Function));
		});
		it('should invoke stringifyJson on data before its sent', () => {
			let worker1 = new Worker('test.js');

			spyOn(GeneralUtils, 'stringifyJson');
			WorkerUtils.sendMessage(worker1, {
				id: 1,
				taskId: 2,
				params: [ 1, 2 ],
				action: 'execute',
				method: function () {}
			});

			expect(GeneralUtils.stringifyJson).toHaveBeenCalledWith({
				id: 1,
				taskId: 2,
				params: [ 1, 2 ],
				action: 'execute',
				method: 'function%20method()%20%7B%7D',
				isEncodedMethod: true
			});
		});
		it('should send message to worker', () => {
			let worker1 = new Worker('test.js');

			spyOn(worker1, 'postMessage');
			WorkerUtils.sendMessage(worker1, {
				id: 1,
				taskId: 2,
				params: [ 1, 2 ],
				action: 'execute',
				method: function () {}
			});

			expect(worker1.postMessage).toHaveBeenCalledWith(jasmine.any(String));
		});
	});



});