import RegisterWorker from '../src/RegisterWorker';

import TaskQueue from '../src/TaskQueue';
import WorkerUtils from '../src/utils/worker';
import Promise from '../src/vendor/Promise';
import TaskStatusEnum from '../src/enums/TaskStatusEnum';
import WorkerActionEnum from '../src/enums/WorkerActionEnum';
import WorkerStatusEnum from '../src/enums/WorkerStatusEnum';

function addTask() {
	let task = {
		method: function add(a, b) {
			return a + b;
		},
		params: [ 1, 2 ],
		resolver: {
			reject: function () {}
		}
	};

	return task;
}

describe('RegisterWorker', () => {
	describe('Basic tests', () => {
		it('verify it is defined and its methods', () => {
			expect(RegisterWorker).toBeDefined();
		});
	});

	describe('constructor', () => {
		it('should init without any config', () => {
			spyOn(WorkerUtils, 'sendMessage');
			spyOn(WorkerUtils, 'addNew');

			let rw = new RegisterWorker();

			expect(rw.id).toBeDefined();
			expect(rw.id.length).toBe(36);
			expect(rw.status).toEqual(WorkerStatusEnum.IDLE);
			expect(rw.createdAt.toString().length).toBe(13);
			expect(rw.lastJobCompletedAt).toBe(null);
			expect(rw.totalJobsCompleted).toBe(0);
			expect(rw.totalJobsFailed).toBe(0);
			expect(rw.worker instanceof Worker).toBe(true);

			expect(WorkerUtils.sendMessage).toHaveBeenCalledWith(rw.worker, {
				id: rw.id,
				action: WorkerActionEnum.READY,
				message: 'Worker is ready.'
			});

			expect(WorkerUtils.addNew).toHaveBeenCalledWith(rw);
		});
		it('should init with config', () => {
			spyOn(WorkerUtils, 'sendMessage');
			spyOn(WorkerUtils, 'addNew');

			let rw = new RegisterWorker({
				url: 'my-worker.js'
			});

			expect(rw.worker instanceof Worker).toBe(true);
		});
	});

	describe('method: addEventListeners', () => {
		it('should attach worker: message, error and exit listeners', () => {
			let rw = new RegisterWorker();

			spyOn(rw.worker, 'addEventListener');

			rw.addEventListeners();

			expect(rw.worker.addEventListener).toHaveBeenCalled();
		});
	});

	describe('method: onWorkerMessage', () => {
		it('should return if no event data present', () => {
			let rw = new RegisterWorker();

			expect(rw.onWorkerMessage()).toBe(false);
		});

		it('should return if data-action is not `execute`', () => {
			let rw = new RegisterWorker();

			expect(rw.onWorkerMessage({action: '!!exec'})).toBe(false);
		});

		it('should reject task resolver when event data has error key defined', () => {
			let rw = new RegisterWorker();

			expect(rw.onWorkerMessage({
				action: WorkerActionEnum.EXEC,
				error: 'Something wrong with the result',
				result: null
			})).toBe(false);
		});

		it('should resolve task resolver when event data has no error key defined', () => {
			let rw = new RegisterWorker();

			expect(rw.onWorkerMessage({
				action: WorkerActionEnum.EXEC,
				error: null,
				result: 5
			})).toBe(false);
		});
	});

	describe('method: onError', () => {
		it('should set Worker status as terminated', () => {
			let rw = new RegisterWorker();

			rw.onError();

			expect(rw.status).toBe(WorkerStatusEnum.TERMINATED);
		});
		it('should get Active tasks list', () => {
			let rw = new RegisterWorker();

			spyOn(TaskQueue, 'getActive');

			rw.onError();

			expect(TaskQueue.getActive).toHaveBeenCalled();
		});
		it('should match the activeTasksRunningOnWorker', () => {
			let task1,
				rw = new RegisterWorker();

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];

			task1.status = TaskStatusEnum.ACTIVE;
			task1.runningOnWorkerId = rw.id;

			expect(rw.onError('')).toEqual([ task1 ])

		});
	});
});
