import MainThread from '../src/MainThread';

import TaskQueue from '../src/TaskQueue';
import Promise from '../src/vendor/Promise';
import WorkerUtils from '../src/utils/worker';
import GeneralUtils from '../src/utils/generalUtils';
import RegisterWorker from '../src/RegisterWorker';
import TaskStatusEnum from '../src/enums/TaskStatusEnum';
import WarningTextEnum from '../src/enums/WarningTextEnum';
import WorkerStatusEnum from '../src/enums/WorkerStatusEnum';

function addTask() {
	let task = {
		method: function add(a, b) {
			return a + b;
		},
		params: [ 1, 2 ]
	};

	return task;
}

let mt;

describe('MainThread', () => {
	beforeEach(() => {
		mt = new MainThread({});
	});

	describe('Basic Tests', () => {
		it('should verify it is defined', () => {
			expect(MainThread).toBeDefined();
		});
	});

	describe('constructor', () => {
		it('should set default properties on object created', () => {
			expect(mt.minWorkers).toBeDefined();
			expect(mt.maxWorkers).toBeDefined();
			expect(mt.workers).toBeDefined();
			expect(mt.config).toBeDefined();
		});
		it('should set default minWorkers and maxWorkers when not specified', () => {
			expect(mt.minWorkers).toBe(1);
			expect(mt.maxWorkers).toBe(3);
		});
		it('should set user-defined minWorkers and maxWorkers', () => {
			mt = new MainThread({
				minWorkers: 3,
				maxWorkers: 5
			});
			expect(mt.minWorkers).toBe(3);
			expect(mt.maxWorkers).toBe(5);
		});
		it('should cap maxWorkers to minWorkers when less than minWorkers', () => {
			mt = new MainThread({
				minWorkers: 4,
				maxWorkers: 3
			});
			expect(mt.minWorkers).toBe(4);
			expect(mt.maxWorkers).toBe(4);
		});
	});

	describe('method: getAllWorkers', () => {
		it('should call WorkerUtils getAll method', () => {
			spyOn(WorkerUtils, 'getAll');
			mt.getAllWorkers();
			expect(WorkerUtils.getAll).toHaveBeenCalled();
		});
	});

	describe('method: getActiveWorkers', () => {
		it('should call WorkerUtils getActive method', () => {
			spyOn(WorkerUtils, 'getActive');
			mt.getActiveWorkers();
			expect(WorkerUtils.getActive).toHaveBeenCalled();
		});
	});

	describe('method: getIdleWorkers', () => {
		it('should call WorkerUtils getIdle method', () => {
			spyOn(WorkerUtils, 'getIdle');
			mt.getIdleWorkers();
			expect(WorkerUtils.getIdle).toHaveBeenCalled();
		});
	});

	describe('method: getTerminatedWorkers', () => {
		it('should call WorkerUtils getTerminated method', () => {
			spyOn(WorkerUtils, 'getTerminated');
			mt.getTerminatedWorkers();
			expect(WorkerUtils.getTerminated).toHaveBeenCalled();
		});
	});

	describe('method: terminateAllWorkers', () => {
		it('should call WorkerUtils terminateAll method', () => {
			spyOn(WorkerUtils, 'terminateAll');
			mt.terminateAllWorkers();
			expect(WorkerUtils.terminateAll).toHaveBeenCalled();
		});
	});

	describe('method: terminateWorker', () => {
		it('should call WorkerUtils terminate method', () => {
			spyOn(WorkerUtils, 'terminate');
			mt.terminateWorker(2);
			expect(WorkerUtils.terminate).toHaveBeenCalledWith(2);
		});
	});

	describe('method: broadCastAll', () => {
		it('should call WorkerUtils broadCastAll method', () => {
			spyOn(WorkerUtils, 'broadCastAll');
			mt.broadCastAll('Hello');
			expect(WorkerUtils.broadCastAll).toHaveBeenCalledWith('Hello');
		});
	});

	describe('method: broadCastTo', () => {
		it('should call WorkerUtils broadCastTo method', () => {
			spyOn(WorkerUtils, 'broadCastTo');
			mt.broadCastTo(2, 'Hello');
			expect(WorkerUtils.broadCastTo).toHaveBeenCalledWith(2, 'Hello');
		});
	});

	describe('method: exec', () => {
		it('should throw error if params passed are not Array', () => {
			expect(function () {
				mt.exec('add', {});
			}).toThrow(new TypeError('Array expected as argument "params"'));
		});
		it('should add task to Queue', () => {
			spyOn(mt.taskQueue, '_add');
			spyOn(mt, '_runQueuedTask');

			let result = mt.exec('add', [ 1, 2 ]).then(() => {
				expect(mt.taskQueue._add).toHaveBeenCalledWith(jasmine.any(Object));
				expect(mt._runQueuedTask).toHaveBeenCalled();

				expect(mt.taskQueue.tasks.length).toBe(1);
				expect(mt.taskQueue.tasks[0]).toEqual({
					method: 'add',
					params: [ 1, 2 ],
					resolver: jasmine.any(Function),
					priority: TaskStatusEnum.LOW
				});
			});

			expect(GeneralUtils.isPromise(result)).toBe(true);
			expect(typeof result.then === 'function').toBe(true);
		});
	});

	describe('method: _runQueuedTask', () => {
		it('if no pending tasks, should try to terminate extra idle workers', () => {
			mt.config = { url: 'test.js' };
			spyOn(WorkerUtils, 'terminateAllExceptOne');

			mt._runQueuedTask();

			setTimeout(function () {
				expect(WorkerUtils.terminateAllExceptOne).toHaveBeenCalledWith(mt.config.minWorkers);
			}, 500);
		});
		it('register new worker if tasks pending and workers length less than minWorkers', () => {
			mt.config = { minWorkers: 1, maxWorkers: 3, url: 'test.js' };
			spyOn(mt, 'register');

			mt.taskQueue._add(addTask());
			mt.taskQueue._add(addTask());
			mt.taskQueue._add(addTask());

			mt._runQueuedTask();

			expect(mt.register).toHaveBeenCalled();
		});
		it('Worker already present to process task and successfully executes task', () => {
			mt.config = { minWorkers: 1, maxWorkers: 3, url: 'test.js' };
			spyOn(mt, 'register');
			spyOn(mt.taskQueue, '_remove');

			mt.taskQueue._add(addTask());
			mt.taskQueue._add(addTask());
			mt.taskQueue._add(addTask());

			let worker = new RegisterWorker(mt.config),
				task1 = mt.taskQueue.tasks[0];

			spyOn(worker.worker, 'sendMessage').and.callFake(() => {
		        return {
		        	then: (successCallback) => {
		        		successCallback();
		        		return {
		        			catch: (err) => {

		        			}
		        		}
		        	}
		        };
		    });

			mt._runQueuedTask();

			expect(mt.register).not.toHaveBeenCalled();

			expect(task1.runningOnWorkerId).toEqual(worker.id);
			expect(mt.taskQueue._remove).toHaveBeenCalledWith(task1.id);

			expect(worker.worker.sendMessage).toHaveBeenCalled();
			expect(worker.status).toEqual(WorkerStatusEnum.IDLE)
		});
	});

	describe('method: _ensureMinWorkers', () => {
		it('should call register method if workers length less than minWorkers', () => {
			spyOn(mt, 'register');
			mt._ensureMinWorkers();
			expect(mt.register).toHaveBeenCalled();
		});
		it('should not call register method if workers length greater than or equal to minWorkers', () => {
			spyOn(mt, 'register');
			mt.workers.length = 1;
			mt._ensureMinWorkers();
			expect(mt.register).not.toHaveBeenCalled();
		});
	});

	describe('method: register', () => {
		it('should throw error if no config passed', () => {
			mt.config = undefined;
			expect(function() {
				mt.register()
			}).toThrow(new Error(WarningTextEnum.CONFIG_REQUIRED));
		});
		it('should throw error if no config-url is passed', () => {
			mt.config = { url: undefined };
			expect(function() {
				mt.register()
			}).toThrow(new Error(WarningTextEnum.URL_REQUIRED));
		});
		it('should register a worker when config is right', () => {
			mt.config = { url: 'test.js' };
			expect(mt.register() instanceof RegisterWorker).toEqual(true);
		});
	});

	describe('method: init', () => {
		it('should set taskQueue on this', () => {
			mt.init();
			expect(mt.taskQueue).toEqual(TaskQueue);
			expect(mt.taskQueue.tasks).toEqual([]);
		});
	});
});
