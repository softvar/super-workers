/**
 * A Tab utility file to deal with tab operations
 */
import Promise from '../vendor/Promise';
import ArrayUtils from './array';
import GeneralUtils from './generalUtils';

import WorkerStatusEnum from '../enums/WorkerStatusEnum';
import WarningTextEnum from '../enums/WarningTextEnum';

let WorkerUtils = {
	workers: [],
	config: {},

	/**
   * Check is worker is present on window
   * @return {Boolean} [description]
   */
	_isWebWorkerSupported: () => {
		if (typeof window.Worker === 'function' ||
						(typeof window.Worker === 'object' || typeof Worker.prototype.constructor === 'function')) {
			return true;
		}
		return false;
	},

	/**
   * Remove a tab from a list of all workers.
   * This is required when users opts for removing the idle workers from the list of workers.
   * This can be done explictly by passing `removeidleworkers` key while instantiating Parent.
   * @param  {Object} tab
   */
	_remove: (worker) => {
		let index;

		index = ArrayUtils.searchByKeyName(WorkerUtils.workers, 'id', worker.id, 'index');
		WorkerUtils.workers.splice(index, 1);
	},

	/**
   * Add a new worker to the Array of workers
   * @param  {Object} worker
   * @return {Object} - this
   */
	addNew: (worker) => {
		WorkerUtils.workers.push(worker);
		return this;
	},
	/**
   * Filter out all the active workers
   * @return {Array} - only the active workers
   */
	getActive: () => {
		return WorkerUtils.workers.filter(worker => worker.status === WorkerStatusEnum.ACTIVE);
	},
	/**
   * Filter out all the idle workers
   * @return {Array} - only the idle workers
   */
	getIdle: () => {
		return WorkerUtils.workers.filter(worker => worker.status === WorkerStatusEnum.IDLE);
	},
	/**
   * Filter out all the terminated workers
   * @return {Array} - only the idle workers
   */
	getTerminated: () => {
		return WorkerUtils.workers.filter(worker => worker.status === WorkerStatusEnum.TERMINATED);
	},
	/**
   * To get list of all workers(idle/active).
   * Note: idle workers will not be returned if `removeidleworkers` key is paased while instantiaiting Parent.
   * @return {Array} - list of all workers
   */
	getAll: () => {
		return WorkerUtils.workers;
	},

	/**
   * Terminate a specific tab
   * @param  {String} id
   * @return {Object} this
   */
	terminate: (id) => {
		if (!id) {
			console.warn(WarningTextEnum.NO_ID_PROVIDED);
			return WorkerUtils;
		}

		let worker = ArrayUtils.searchByKeyName(WorkerUtils.workers, 'id', id, 'object');

		if (worker && worker.worker &&
						worker.status === WorkerStatusEnum.TERMINATED
		) {
			console.warn(WarningTextEnum.WORKER_ALREADY_TERMINATED);
			return WorkerUtils;
		}

		if (worker && worker.worker &&
						worker.worker.terminate
		) {
			worker.worker.terminate();
			worker.status = WorkerStatusEnum.TERMINATED;
		}

		return WorkerUtils;
	},
	/**
   * Terminate all (active+idle) workers using a native method `Terminate` available on window.open reference.
   * @return {WorkerUtils} this
   */
	terminateAllExceptOne: (minWorkers) => {
		return WorkerUtils.terminateAll(true, minWorkers || 1);
	},
	/**
   * Terminate all active workers using a native method `Terminate` available on window.open reference.
   * @return {WorkerUtils} this
   */
	terminateAll: (exceptOne, minWorkers) => {
		let i,
			nonTerminatedWorkers;

		if (exceptOne) {
			// terminate only idle workers
			nonTerminatedWorkers = [].concat(WorkerUtils.getIdle());
		} else {
			nonTerminatedWorkers = [].concat(WorkerUtils.getActive()).concat(WorkerUtils.getIdle());
		}

		for (i = 0; i < nonTerminatedWorkers.length; i++) {
			// ensure minWorkers should be there
			if (exceptOne && WorkerUtils.getIdle() && WorkerUtils.getIdle().length <= minWorkers) {
				return WorkerUtils;
			}

			if (nonTerminatedWorkers[i] &&
								nonTerminatedWorkers[i].worker &&
								nonTerminatedWorkers[i].worker.terminate
			) {
				nonTerminatedWorkers[i].worker.terminate();
				nonTerminatedWorkers[i].status = WorkerStatusEnum.TERMINATED;
			}
		}

		return WorkerUtils;
	},
	/**
   * Send a postmessage to every active Child tab(excluding itself i.e Parent Tab)
   * @param  {String} config
   */
	broadCastAll: (config) => {
		let i;
		let workers = WorkerUtils.getActive() || [];

		for (i = 0; i < workers.length; i++) {
			WorkerUtils.sendMessage(workers[i], config);
		}

		return WorkerUtils;
	},
	/**
   * Send a postmessage to a specific Child tab
   * @param  {String} id
   * @param  {String} config
   */
	broadCastTo: (id, config) => {
		let targetedWorker;
		let workers = [].concat(WorkerUtils.getActive()).concat(WorkerUtils.getIdle());

		targetedWorker = ArrayUtils.searchByKeyName(workers, 'id', id);
		if (targetedWorker) {
			WorkerUtils.sendMessage(targetedWorker, config);
		}

		return WorkerUtils;
	},
	/**
   * Send a postMessage to the desired window/frame
   * @param  {Object}  target
   * @param  {String}  msg
   */
	sendMessage: (target, config) => {
		let msg;
		let isEncodedMethod = false;

		config = config || {};
		if (config.method && typeof config.method === 'function') {
			config.method = GeneralUtils.serializeFunction(config.method);
			isEncodedMethod = true;
		}

		if (!config.resolver) {
			config.resolver = Promise.defer();
		}

		msg = {
			id: config.id,
			taskId: config.taskId,
			method: config.method,
			params: config.params,
			action: config.action,
			isEncodedMethod
		};

		msg = GeneralUtils.stringifyJson(msg);

		if (target && target.postMessage) {
			target.postMessage(msg);
		}

		return config.resolver.promise;
	}
};

export default WorkerUtils;
