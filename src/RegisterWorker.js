import UUID from './vendor/uuid';
import TaskQueue from './TaskQueue';
import WorkerUtils from './utils/worker';
import GeneralUtils from './utils/generalUtils';
import WorkerStatusEnum from './enums/WorkerStatusEnum';
import WorkerActionEnum from './enums/WorkerActionEnum';

// Named Class expression
class RegisterWorker {
  /**
   * Invoked when the object is instantiated
   */
  constructor(config) {
    this.init(config);
  };
  // reject all running tasks on worker error
  onError(error) {
    this.status = WorkerStatusEnum.TERMINATED;
    let activeTasks = TaskQueue.getActive(),
      activeTasksRunningOnWorker = [];

    if (activeTasks && activeTasks.length) {
      activeTasksRunningOnWorker = activeTasks.filter(task => task.runningOnWorkerId === this.id);
    }

    for (let i = 0; i < activeTasksRunningOnWorker.length; i++) {
      activeTasksRunningOnWorker[i].resolver.reject(error);
    }

    return activeTasksRunningOnWorker;
  };

   /**
   * Attach postmessage, native and custom listeners to the window
   */
  addEventListeners() {
    this.worker.addEventListener('message', this.onWorkerMessage.bind(this), false);
    // listen for worker messages error
    this.worker.addEventListener('error', this.onError.bind(this));
    // listen for worker messages exit
    this.worker.addEventListener('exit', () => {
      let error = new Error('Worker terminated unexpectedly');

      this.onError(error).bind(this);
    });
  };

  onWorkerMessage(ev) {
    if (!ev || !ev.data || ev.data.action !== WorkerActionEnum.EXEC) {
      return false;
    }

    let task = TaskQueue._getCompleted(ev.data.taskId);

    if (ev.data.error) {
      task.resolver.reject(GeneralUtils.deSerializeError(ev.data.error));
      this.totalJobsFailed += 1;
      this.lastJobFaileddAt = +new Date();
      if (task.onError && typeof task.onError === 'function') {
        task.onError();
      }
      return false;
    }
    task.resolver.resolve(ev.data.result);
    this.totalJobsCompleted += 1;
    this.lastJobCompletedAt = +new Date();
    if (task.onSuccess && typeof task.onSuccess === 'function') {
      task.onSuccess();
    }
    return true;
  };
  /**
   * Open a new tab
   * @param  {Object} config - Refer API for config keys
   * @return {Object} this
   */
  init(config) {
    config = config || {};

    Object.assign(this, config);
    this.id = UUID.generate() || (WorkerUtils.workers.length + 1);
    this.status = WorkerStatusEnum.IDLE;
    this.createdAt = +new Date();
    this.lastJobCompletedAt = null;
    this.totalJobsCompleted = 0;
    this.totalJobsFailed = 0;

    this.worker = new Worker(config.url);

    WorkerUtils.sendMessage(this.worker, {
      id: this.id,
      action: WorkerActionEnum.READY,
      message: 'Worker is ready.'
    });

    // TODO: only add methods which are needed
    Object.assign(this.worker, {
      sendMessage: WorkerUtils.sendMessage
    });

    // Add Worker event-listeners
    this.addEventListeners();

    // Push it to the list of workers
    WorkerUtils.addNew(this);

     // Return reference for chaining purpose
    return this;
  };
};

export default RegisterWorker;
