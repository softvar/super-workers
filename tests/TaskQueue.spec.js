import TaskQueue from '../src/TaskQueue';

import ArrayUtils from '../src//utils/array';
import TaskStatusEnum from '../src/enums/TaskStatusEnum';

function addTask() {
	let task = {
		method: function add(a, b) {
			return a + b;
		},
		params: [ 1, 2 ]
	};

	return task;
}

describe('TaskQueue', () => {
	beforeEach(() => {
		TaskQueue.tasks = [];
		TaskQueue.completedTasks = [];
	});

	describe('Basic tests', () => {
		it('verify it is defined and its methods', () => {
			expect(TaskQueue).toBeDefined();

			expect(TaskQueue.config).toEqual({});
			expect(TaskQueue.tasks.length).toBe(0);
			expect(TaskQueue.completedTasks.length).toBe(0);

			expect(TaskQueue._add).toBeDefined();
			expect(TaskQueue._addToCompletedList).toBeDefined();
			expect(TaskQueue._remove).toBeDefined();
			expect(TaskQueue._getCompleted).toBeDefined();
			expect(TaskQueue.get).toBeDefined();
			expect(TaskQueue.getNextTask).toBeDefined();
			expect(TaskQueue.getActive).toBeDefined();
			expect(TaskQueue.getCompleted).toBeDefined();
			expect(TaskQueue.getFailed).toBeDefined();
			expect(TaskQueue.getAll).toBeDefined();
		});
	});
	describe('method: _add', () => {
		it('throw error if no task is provided', () => {
			expect(TaskQueue._add).toThrow(new Error('No task passed for queuing'));
		});
		it('should throw error if task passed is not an object', () => {
			expect(function() { TaskQueue._add([]) }).toThrow(new Error('Task should be an object'));
		});
		it('should add task to queue', () => {
			expect(TaskQueue.tasks.length).toBe(0);

			TaskQueue._add(addTask());
			expect(TaskQueue.tasks.length).toBe(1);
			expect(TaskQueue.tasks[0].status).toEqual(TaskStatusEnum.QUEUED);
		});
	});
	describe('method: _addToCompletedList', () => {
		it('throw error if no task is provided', () => {
			expect(TaskQueue._add).toThrow(new Error('No task passed for queuing'));
		});
		it('should throw error if task passed is not an object', () => {
			expect(function() { TaskQueue._add([]) }).toThrow(new Error('Task should be an object'));
		});
		it('should add task to completed list of tasks', () => {
			expect(TaskQueue.completedTasks.length).toBe(0);

			TaskQueue._addToCompletedList(addTask());

			expect(TaskQueue.completedTasks.length).toBe(1);
		});
	});
	describe('method: _remove', () => {
		it('throw error if no id is provided', () => {
			expect(TaskQueue._remove).toThrow(new Error('No id passed'));
		});
		it('should remove task from tasks list and add to completed list', () => {
			spyOn(TaskQueue, '_addToCompletedList');
			// Add three tasks
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			let task1 = TaskQueue.tasks[0],
				task2 = TaskQueue.tasks[1],
				task3 = TaskQueue.tasks[2];

			expect(TaskQueue.tasks.length).toBe(3);

			TaskQueue._remove(task1.id);
			expect(TaskQueue._addToCompletedList).toHaveBeenCalled();
			expect(TaskQueue.tasks.length).toBe(2);

			TaskQueue._remove(task2.id);
			expect(TaskQueue._addToCompletedList).toHaveBeenCalled();
			expect(TaskQueue.tasks.length).toBe(1);

			TaskQueue._remove('garbage-123456-xxx'); // No such id
			expect(TaskQueue._addToCompletedList).toHaveBeenCalled();
			expect(TaskQueue.tasks.length).toBe(1);

			TaskQueue._remove(task3.id);
			expect(TaskQueue._addToCompletedList).toHaveBeenCalled();
			expect(TaskQueue.tasks.length).toBe(0);
		});
	});
	describe('method: _getCompleted', () => {
		it('throw error if no id is provided', () => {
			expect(TaskQueue._getCompleted).toThrow(new Error('No id passed'));
		});
		it('should return completed task corresponding to id, if present', () => {
			let task1, task2;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];

			TaskQueue._addToCompletedList(task1);
			expect(TaskQueue._getCompleted(task1.id)).toEqual(task1);

			expect(TaskQueue._getCompleted('garbage-123-xxx')).toEqual({});

			TaskQueue._addToCompletedList(task2);
			expect(TaskQueue._getCompleted(task2.id)).toEqual(task2);
		});
	});
	describe('method: get', () => {
		it('should return the corresponding id task', () => {
			let task1, task2;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];

			expect(TaskQueue.get(task1.id)).toEqual(task1);
			expect(TaskQueue.get('garbage-123-xxx')).toEqual({});
			expect(TaskQueue.get(task2.id)).toEqual(task2);
		});
		it('should return the last task in the list(first to be inserted) when no id passed', () => {
			let task1, task2;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];

			expect(TaskQueue.get()).toEqual(task1);
		});
		it('should return {} in the list(first to be inserted) when no id passed and no tasks present', () => {
			let task1, task2;

			expect(TaskQueue.get()).toEqual({});
		});
	});
	describe('method: getNextTask', () => {
		it('', () => {
			spyOn(ArrayUtils, 'sortOnStringType');
			spyOn(TaskQueue, 'get');

			TaskQueue.getNextTask();

			expect(ArrayUtils.sortOnStringType).toHaveBeenCalledWith(TaskQueue.tasks, 'priority');
			expect(TaskQueue.get).toHaveBeenCalled();
		});
	});
	describe('method: getActive', () => {
		it('should return only active tasks', () => {
			expect(TaskQueue.getActive().length).toBe(0);

			let task1, task2, task3;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];
			task3 = TaskQueue.tasks[1];

			task2.status = TaskStatusEnum.ACTIVE;

			expect(TaskQueue.getActive().length).toBe(1);
		});
	});
	describe('method: getCompleted', () => {
		it('should return only completed tasks', () => {
			expect(TaskQueue.getCompleted().length).toBe(0);

			let task1, task2, task3;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];
			task3 = TaskQueue.tasks[1];

			task2.status = TaskStatusEnum.COMPLETED;

			expect(TaskQueue.getCompleted().length).toBe(1);
		});
	});
	describe('method: getFailed', () => {
		it('should return only failed tasks', () => {
			expect(TaskQueue.getFailed().length).toBe(0);

			let task1, task2, task3;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];
			task3 = TaskQueue.tasks[1];

			task2.status = TaskStatusEnum.FAILED;

			expect(TaskQueue.getFailed().length).toBe(1);
		});
	});
	describe('method: getAll', () => {
		it('should return all tasks', () => {
			expect(TaskQueue.getAll().length).toBe(0);

			let task1, task2, task3;

			TaskQueue._add(addTask());
			TaskQueue._add(addTask());
			TaskQueue._add(addTask());

			task1 = TaskQueue.tasks[0];
			task2 = TaskQueue.tasks[1];
			task3 = TaskQueue.tasks[1];

			task1.status = TaskStatusEnum.ACTIVE;
			task2.status = TaskStatusEnum.FAILED;
			task3.status = TaskStatusEnum.COMPLETED;

			expect(TaskQueue.getAll().length).toBe(3);
		});
	});
});
