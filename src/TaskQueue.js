import UUID from './vendor/uuid';
import ArrayUtils from './utils/array';
import TaskStatusEnum from './enums/TaskStatusEnum';

let TaskQueue = {
  config: {},
  tasks: [],
  completedTasks: [],

  /**
   * Add task to the queue
   * @param {Object} task - with proper config
   */
  _add: (task) => {
    if (!task) { throw new Error('No task passed for queuing'); }
    if (typeof task !== 'object') { throw new Error('Task should be an object'); }

    task.id = UUID.generate() || TaskQueue.tasks.length;
    task.status = TaskStatusEnum.QUEUED;
    TaskQueue.tasks.push(task);
  },
  _addToCompletedList: (task) => {
    TaskQueue.completedTasks.push(task);
  },
  /**
   * Remove a task from the queue
   * @param {Number} task
   */
  _remove: (id) => {
    if (!id) {
      throw new Error('No id passed');
    }

    let task;

    task = ArrayUtils.searchByKeyName(TaskQueue.tasks, 'id', id, 'both');
    TaskQueue._addToCompletedList(task.obj);
    TaskQueue.tasks.splice(task.index, 1);

    return this;
  },
  _getCompleted: (id) => {
    if (!id) {
      throw new Error('No id passed');
    }

    let task = ArrayUtils.searchByKeyName(TaskQueue.completedTasks, 'id', id);

    return task || {};
  },
  /**
   * Get the task from the queue
   * @param {id} task
   * @return {Object} task being queried or an empty Object(if not found)
   */
  get: (id) => {
    if (!id) {
      return TaskQueue.tasks[TaskQueue.tasks.length - 1] || {};
    }

    let task = ArrayUtils.searchByKeyName(TaskQueue.tasks, 'id', id);

    return task || {};
  },
  /**
   * Get next available task from the queue
   * @return {Object} task being queried or an empty Object(if not found)
   */
  getNextTask: () => {
    // Sort as per task priorities
    ArrayUtils.sortOnStringType(TaskQueue.tasks, 'priority');
    return TaskQueue.get();
  },
  /**
   * Filter out all the active tasks
   * @return {Array} - only the active tasks
   */
  getActive: () => {
    return TaskQueue.tasks.filter(task => task.status === TaskStatusEnum.ACTIVE);
  },
  /**
   * Filter out all the completed tasks
   * @return {Array} - only the completed tasks
   */
  getCompleted: () => {
    return TaskQueue.tasks.filter(task => task.status === TaskStatusEnum.COMPLETED);
  },
  /**
   * Filter out all the failed tasks
   * @return {Array} - only the failed tasks
   */
  getFailed: () => {
    return TaskQueue.tasks.filter(task => task.status === TaskStatusEnum.FAILED);
  },
  /**
   * To get list of all tasks
   * @return {Array} - list of all tasks
   */
  getAll: () => {
    return TaskQueue.tasks;
  }
};

export default TaskQueue;
