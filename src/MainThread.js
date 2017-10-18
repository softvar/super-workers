import RegisterWorker from './RegisterWorker';

import Promise from './vendor/Promise';
import TaskQueue from './TaskQueue';

import WorkerUtils from './utils/worker';

import WorkerActionEnum from './enums/WorkerActionEnum';
import TaskStatusEnum from './enums/TaskStatusEnum';
import WorkerStatusEnum from './enums/WorkerStatusEnum';
import WarningTextEnum from './enums/WarningTextEnum';

// Named Class expression
class MainThread {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    config = config || {};

    if (typeof config.minWorkers === 'undefined') {
      config.minWorkers = 1;
    }

    if (typeof config.maxWorkers === 'undefined') {
      config.maxWorkers = (window.navigator && window.navigator.hardwareConcurrency) || 3;
    }

    // max workers should not be less than min workers
    config.maxWorkers = Math.max(config.maxWorkers, config.minWorkers);

    // reset workers with every new Object
    this.workers = WorkerUtils.workers = [];

    Object.assign(this, config);
    this.config = config;

    WorkerUtils.config = config;

    this.init();
  };

  /**
   * Return list of all workers
   * @return {Array}
   */
  getAllWorkers() {
    return WorkerUtils.getAll();
  };

  /**
   * Return list of all ACTIVE workers
   * @return {Array}
   */
  getActiveWorkers() {
    return WorkerUtils.getActive();
  };

  /**
   * Return list of all IDLE workers
   * @return {Array}
   */
  getIdleWorkers() {
    return WorkerUtils.getIdle();
  };

  /**
   * Return list of all CLOSED workers
   * @return {Array}
   */
  getTerminatedWorkers() {
    return WorkerUtils.getTerminated();
  };

  /**
   * Terminate all workers at once
   * @return {Object}
   */
  terminateAllWorkers() {
    return WorkerUtils.terminateAll();
  };

  /**
   * Terminate a specific worker
   * @return {Object}
   */
  terminateWorker(id) {
    return WorkerUtils.terminate(id);
  };

  /**
   * Send a postmessage to all ACTIVE workers
   * @return {Object}
   */
  broadCastAll(msg) {
    return WorkerUtils.broadCastAll(msg);
  };

  /**
   * Send a postmessage to a specific worker
   * @return {Object}
   */
  broadCastTo(id, msg) {
    return WorkerUtils.broadCastTo(id, msg);
  };

  /**
   * API methods exposed for Public ends here
   */
  exec(method, params, config) {
    // validate type of arguments
    if (params && !Array.isArray(params)) {
      throw new TypeError('Array expected as argument "params"');
    }

    if (!config) {
      config = {};
    }

    let resolver = Promise.defer();

    let task = {};

    Object.assign(task, config);
    Object.assign(task, {
      method: method,
      params: params,
      resolver: resolver,
      priority: (config && config.priority) || TaskStatusEnum.LOW
    });

    this.taskQueue._add(task);
    this._runQueuedTask();

    return resolver.promise;
  };

  _runQueuedTask() {
    if (!this.taskQueue.tasks.length) {
      // Wait for some time for resolve/reject promises
      setTimeout(() => {
        WorkerUtils.terminateAllExceptOne(this.config.minWorkers);
      }, 1000);
    }

    let nextQueuedTask = this.taskQueue.getNextTask();
    let availableWorker = WorkerUtils.getIdle()[0];

    if (!availableWorker && (WorkerUtils.getActive().length + WorkerUtils.getIdle().length < this.config.maxWorkers)) {
      // create a new worker
      this.register();
      availableWorker = WorkerUtils.getIdle()[0];
    }

    if (availableWorker) {
      nextQueuedTask.runningOnWorkerId = availableWorker.id;

      // remove the task from queue list
      this.taskQueue._remove(nextQueuedTask.id);
      // if task is not already completed
      if (nextQueuedTask.status === TaskStatusEnum.QUEUED) {
        availableWorker.status = WorkerStatusEnum.ACTIVE;
        nextQueuedTask.status = TaskStatusEnum.ACTIVE;

        // send the request to worker to execute
        availableWorker.worker.sendMessage(
          availableWorker.worker, {
            id: availableWorker.id,
            resolver: nextQueuedTask.resolver,
            taskId: nextQueuedTask.id,
            method: nextQueuedTask.method,
            params: nextQueuedTask.params,
            action: WorkerActionEnum.EXEC
          }
        ).then((data) => {
          availableWorker.status = WorkerStatusEnum.IDLE;
          if (data) {
            this._runQueuedTask(); // trigger next task in the queue
          }
        })
          .catch((e) => {
            // if the worker crashed and terminated, remove it from the pool
            if (availableWorker.status === WorkerStatusEnum.TERMINATED) {
              WorkerUtils.terminate(availableWorker.id);
              // If minWorkers set, spin up new workers to replace the crashed ones
              if (this.config.minWorkers) {
                this._ensureMinWorkers();
              }
            } else {
              availableWorker.status = WorkerStatusEnum.IDLE;
            }
            this._runQueuedTask(); // trigger next task in the queue
          });
      }
    }
  };

  _ensureMinWorkers() {
    for (let i = this.workers.length; i < this.config.minWorkers; i++) {
      this.register();
    }
  };

  /**
   * Register a new worker. Config has to be passed with some required keys
   * @return {Object} worker
   */
  register() {
    let config = this.config;

    if (!config) {
      throw new Error(WarningTextEnum.CONFIG_REQUIRED);
    }

    let url = config.url;

    if (!url) {
      throw new Error(WarningTextEnum.URL_REQUIRED);
    }

    let worker = new RegisterWorker(config);

    return worker;
  };

  /**
   * Invoked on object instantiation unless user pass a key to call it explicitly
   */
  init() {
    if (!WorkerUtils._isWebWorkerSupported()) {
      console.warn(WarningTextEnum.WORKER_NOT_SUPPORTED);
      return;
    }

    this.taskQueue = TaskQueue;
    this.taskQueue.tasks = [];
    this.taskQueue.allTasks = [];
  };
};

export default MainThread;
