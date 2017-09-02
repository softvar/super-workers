/*!
 * 
 * super-workers "0.1.0"
 * https://github.com/softvar/super-workers.js
 * MIT LICENSE
 * 
 * Copyright (C) 2017-2018 softvar - A project by Varun Malhotra(https://github.com/softvar)
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SuperWorkers", [], factory);
	else if(typeof exports === 'object')
		exports["SuperWorkers"] = factory();
	else
		root["SuperWorkers"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _Promise = __webpack_require__(1);
	
	var _Promise2 = _interopRequireDefault(_Promise);
	
	var _MainThread = __webpack_require__(2);
	
	var _MainThread2 = _interopRequireDefault(_MainThread);
	
	var _WorkerThread = __webpack_require__(13);
	
	var _WorkerThread2 = _interopRequireDefault(_WorkerThread);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Expose Parent and Child modules on SuperWorkers Object
	 * @type {Object}
	 */
	var SuperWorkers = {
	  MainThread: _MainThread2.default,
	  WorkerThread: _WorkerThread2.default,
	  Promise: _Promise2.default
	};
	
	exports.default = SuperWorkers;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Inspired from - @josdejong(Github) - Promise.js
	 *
	 * ES6 port
	 *
	 * Promise polyfill
	 *
	 * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
	 */
	var Promise = function () {
	  function Promise(handler) {
	    _classCallCheck(this, Promise);
	
	    var self = this;
	    var _resolve2 = void 0,
	        _reject2 = void 0,
	        _process = void 0;
	
	    /**
	     * Create a cancellation error
	     * @param {String} [message]
	     * @extends Error
	     */
	    function CancellationError(message) {
	      this.message = message || 'promise cancelled';
	      this.stack = new Error().stack;
	    }
	
	    CancellationError.prototype = new Error();
	    CancellationError.prototype.constructor = Error;
	    CancellationError.prototype.name = 'CancellationError';
	
	    /**
	     * Create a timeout error
	     * @param {String} [message]
	     * @extends Error
	     */
	    function TimeoutError(message) {
	      this.message = message || 'timeout exceeded';
	      this.stack = new Error().stack;
	    }
	
	    TimeoutError.prototype = new Error();
	    TimeoutError.prototype.constructor = Error;
	    TimeoutError.prototype.name = 'TimeoutError';
	
	    this.CancellationError = CancellationError;
	    this.TimeoutError = TimeoutError;
	
	    /**
	     * Add an onFail callback to the Promise
	     * @param {Function} onFail
	     * @returns {Promise} promise
	     */
	    this['catch'] = function (onFail) {
	      // eslint-disable-line
	      return this.then(null, onFail);
	    };
	
	    if (!(this instanceof Promise)) {
	      throw new SyntaxError('Constructor must be called with the new operator');
	    }
	
	    if (typeof handler !== 'function') {
	      throw new SyntaxError('Function parameter handler(resolve, reject) missing');
	    }
	
	    var _onSuccess = [];
	    var _onFail = [];
	
	    /**
	     * Process onSuccess and onFail callbacks: add them to the queue.
	     * Once the promise is resolve, the function _promise is replace.
	     * @param {Function} onSuccess
	     * @param {Function} onFail
	     * @private
	     */
	    _process = function _process(onSuccess, onFail) {
	      _onSuccess.push(onSuccess);
	      _onFail.push(onFail);
	    };
	
	    /**
	     * Execute given callback, then call resolve/reject based on the returned result
	     * @param {Function} callback
	     * @param {Function} resolve
	     * @param {Function} reject
	     * @returns {Function}
	     * @private
	     */
	    function _then(callback, resolve, reject) {
	      return function (result) {
	        try {
	          var res = callback(result);
	
	          if (res && typeof res.then === 'function' && typeof res['catch'] === 'function') {
	            // method returned a promise
	            res.then(resolve, reject);
	          } else {
	            resolve(res);
	          }
	        } catch (error) {
	          reject(error);
	        }
	      };
	    }
	
	    /**
	     * Add an onSuccess callback and optionally an onFail callback to the Promise
	     * @param {Function} onSuccess
	     * @param {Function} [onFail]
	     * @returns {Promise} promise
	     */
	    this.then = function (onSuccess, onFail) {
	      return new Promise(function (resolve, reject) {
	        var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
	        var f = onFail ? _then(onFail, resolve, reject) : reject;
	
	        _process(s, f);
	      }, self);
	    };
	
	    /**
	     * Resolve the promise
	     * @param {*} result
	     * @type {Function}
	     */
	    _resolve2 = function _resolve(result) {
	      _onSuccess.forEach(function (fn) {
	        fn(result);
	      });
	
	      _process = function _process(onSuccess, onFail) {
	        onSuccess(result);
	      };
	
	      _resolve2 = _reject2 = function _reject() {
	        throw new Error('Promise is already resolved');
	      };
	
	      return self;
	    };
	
	    /**
	     * Reject the promise
	     * @param {Error} error
	     * @type {Function}
	     */
	    _reject2 = function _reject(error) {
	      _onFail.forEach(function (fn) {
	        fn(error);
	      });
	
	      _process = function _process(onSuccess, onFail) {
	        onFail(error);
	      };
	
	      _resolve2 = _reject2 = function _reject() {
	        throw new Error('Promise is already resolved');
	      };
	
	      return self;
	    };
	
	    /**
	     * Cancel te promise. This will reject the promise with a CancellationError
	     * @returns {Promise} self
	     */
	    this.cancel = function () {
	      _reject2(new CancellationError());
	
	      return self;
	    };
	
	    /**
	     * Set a timeout for the promise. If the promise is not resolved within
	     * the time, the promise will be cancelled and a TimeoutError is thrown.
	     * If the promise is resolved in time, the timeout is removed.
	     * @param {number} delay     Delay in milliseconds
	     * @returns {Promise} self
	     */
	    this.timeout = function (delay) {
	      var timer = setTimeout(function () {
	        _reject2(new TimeoutError('Promise timed out after ' + delay + ' ms'));
	      }, delay);
	
	      self.always(function () {
	        clearTimeout(timer);
	      });
	
	      return self;
	    };
	
	    // attach handler passing the resolve and reject functions
	    handler(function (result) {
	      _resolve2(result);
	    }, function (error) {
	      _reject2(error);
	    });
	  }
	
	  // TODO: add support for Promise.catch(Error, callback)
	  // TODO: add support for Promise.catch(Error, Error, callback)
	
	  /**
	   * Execute given callback when the promise either resolves or rejects.
	   * @param {Function} fn
	   * @returns {Promise} promise
	   */
	
	
	  _createClass(Promise, [{
	    key: 'always',
	    value: function always(fn) {
	      return this.then(fn, fn);
	    }
	
	    /**
	     * Create a promise which resolves when all provided promises are resolved,
	     * and fails when any of the promises resolves.
	     * @param {Promise[]} promises
	     * @returns {Promise} promise
	     */
	
	  }], [{
	    key: 'all',
	    value: function all(promises) {
	      return new Promise(function (resolve, reject) {
	        var remaining = promises.length;
	        var results = [];
	
	        if (remaining) {
	          promises.forEach(function (p, i) {
	            p.then(function (result) {
	              results[i] = result;
	              remaining--;
	              if (remaining === 0) {
	                resolve(results);
	              }
	            }, function (error) {
	              remaining = 0;
	              reject(error);
	            });
	          });
	        } else {
	          resolve(results);
	        }
	      });
	    }
	
	    /**
	     * Create a promise resolver
	     * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
	     */
	
	  }, {
	    key: 'defer',
	    value: function defer() {
	      var resolver = {};
	
	      resolver.promise = new Promise(function (resolve, reject) {
	        resolver.resolve = resolve;
	        resolver.reject = reject;
	      });
	
	      return resolver;
	    }
	  }]);
	
	  return Promise;
	}();
	
	exports.default = Promise;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _RegisterWorker = __webpack_require__(3);
	
	var _RegisterWorker2 = _interopRequireDefault(_RegisterWorker);
	
	var _Promise = __webpack_require__(1);
	
	var _Promise2 = _interopRequireDefault(_Promise);
	
	var _TaskQueue = __webpack_require__(5);
	
	var _TaskQueue2 = _interopRequireDefault(_TaskQueue);
	
	var _worker = __webpack_require__(8);
	
	var _worker2 = _interopRequireDefault(_worker);
	
	var _WorkerActionEnum = __webpack_require__(12);
	
	var _WorkerActionEnum2 = _interopRequireDefault(_WorkerActionEnum);
	
	var _TaskStatusEnum = __webpack_require__(7);
	
	var _TaskStatusEnum2 = _interopRequireDefault(_TaskStatusEnum);
	
	var _WorkerStatusEnum = __webpack_require__(11);
	
	var _WorkerStatusEnum2 = _interopRequireDefault(_WorkerStatusEnum);
	
	var _WarningTextEnum = __webpack_require__(10);
	
	var _WarningTextEnum2 = _interopRequireDefault(_WarningTextEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// Named Class expression
	var MainThread = function () {
	  /**
	   * Involed when object is instantiated
	   * Set flags/variables and calls init method to attach event listeners
	   * @param  {Object} config - Refer API/docs for config keys
	   */
	  function MainThread(config) {
	    _classCallCheck(this, MainThread);
	
	    config = config || {};
	
	    if (typeof config.maxWorkers === 'undefined') {
	      config.minWorkers = 1;
	    }
	
	    if (typeof config.maxWorkers === 'undefined') {
	      config.maxWorkers = window.navigator && window.navigator.hardwareConcurrency || 3;
	    }
	
	    // max workers should not be less than min workers
	    config.maxWorkers = Math.max(config.maxWorkers, config.minWorkers);
	
	    // reset workers with every new Object
	    this.workers = _worker2.default.workers = [];
	
	    _extends(this, config);
	    this.config = config;
	
	    _worker2.default.config = config;
	
	    this.init();
	  }
	
	  _createClass(MainThread, [{
	    key: 'getAllWorkers',
	
	
	    /**
	     * Return list of all workers
	     * @return {Array}
	     */
	    value: function getAllWorkers() {
	      return _worker2.default.getAll();
	    }
	  }, {
	    key: 'getActiveWorkers',
	
	
	    /**
	     * Return list of all ACTIVE workers
	     * @return {Array}
	     */
	    value: function getActiveWorkers() {
	      return _worker2.default.getActive();
	    }
	  }, {
	    key: 'getIdleWorkers',
	
	
	    /**
	     * Return list of all IDLE workers
	     * @return {Array}
	     */
	    value: function getIdleWorkers() {
	      return _worker2.default.getIdle();
	    }
	  }, {
	    key: 'getTerminatedWorkers',
	
	
	    /**
	     * Return list of all CLOSED workers
	     * @return {Array}
	     */
	    value: function getTerminatedWorkers() {
	      return _worker2.default.getTerminated();
	    }
	  }, {
	    key: 'terminateAllWorkers',
	
	
	    /**
	     * Terminate all workers at once
	     * @return {Object}
	     */
	    value: function terminateAllWorkers() {
	      return _worker2.default.terminateAll();
	    }
	  }, {
	    key: 'terminateWorker',
	
	
	    /**
	     * Terminate a specific worker
	     * @return {Object}
	     */
	    value: function terminateWorker(id) {
	      return _worker2.default.terminate(id);
	    }
	  }, {
	    key: 'broadCastAll',
	
	
	    /**
	     * Send a postmessage to all ACTIVE workers
	     * @return {Object}
	     */
	    value: function broadCastAll(msg) {
	      return _worker2.default.broadCastAll(msg);
	    }
	  }, {
	    key: 'broadCastTo',
	
	
	    /**
	     * Send a postmessage to a specific worker
	     * @return {Object}
	     */
	    value: function broadCastTo(id, msg) {
	      return _worker2.default.broadCastTo(id, msg);
	    }
	  }, {
	    key: 'exec',
	
	
	    /**
	     * API methods exposed for Public ends here
	     **/
	
	    value: function exec(method, params, config) {
	      // validate type of arguments
	      if (params && !Array.isArray(params)) {
	        throw new TypeError('Array expected as argument "params"');
	      }
	
	      if (!config) {
	        config = {};
	      }
	
	      var resolver = _Promise2.default.defer();
	
	      var task = {};
	
	      _extends(task, config);
	      _extends(task, {
	        method: method,
	        params: params,
	        resolver: resolver,
	        priority: config && config.priority || _TaskStatusEnum2.default.LOW
	      });
	
	      this.taskQueue._add(task);
	      this._runQueuedTask();
	
	      return resolver.promise;
	    }
	  }, {
	    key: '_runQueuedTask',
	    value: function _runQueuedTask() {
	      var _this = this;
	
	      if (!this.taskQueue.tasks.length) {
	        // Wait for some time for resolve/reject promises
	        setTimeout(function () {
	          _worker2.default.terminateAllExceptOne(_this.config.minWorkers);
	        }, 1000);
	      }
	
	      var nextQueuedTask = this.taskQueue.getNextTask(),
	          availableWorker = _worker2.default.getIdle()[0];
	
	      if (!availableWorker && _worker2.default.getActive().length + _worker2.default.getIdle().length < this.config.maxWorkers) {
	        // create a new worker
	        this.register();
	        availableWorker = _worker2.default.getIdle()[0];
	      }
	
	      if (availableWorker) {
	        nextQueuedTask.runningOnWorkerId = availableWorker.id;
	
	        // remove the task from queue list
	        this.taskQueue._remove(nextQueuedTask.id);
	        // if task is not already completed
	        if (nextQueuedTask.status === _TaskStatusEnum2.default.QUEUED) {
	          availableWorker.status = _WorkerStatusEnum2.default.ACTIVE;
	          nextQueuedTask.status = _TaskStatusEnum2.default.ACTIVE;
	
	          // send the request to worker to execute
	          availableWorker.worker.sendMessage(availableWorker.worker, {
	            id: availableWorker.id,
	            resolver: nextQueuedTask.resolver,
	            taskId: nextQueuedTask.id,
	            method: nextQueuedTask.method,
	            params: nextQueuedTask.params,
	            action: _WorkerActionEnum2.default.EXEC
	          }).then(function (data) {
	            availableWorker.status = _WorkerStatusEnum2.default.IDLE;
	            if (data) {
	              _this._runQueuedTask(); // trigger next task in the queue
	            }
	          }).catch(function (e) {
	            // if the worker crashed and terminated, remove it from the pool
	            if (availableWorker.status === _WorkerStatusEnum2.default.TERMINATED) {
	              _worker2.default.terminate(availableWorker.id);
	              // If minWorkers set, spin up new workers to replace the crashed ones
	              if (_this.config.minWorkers) {
	                _this._ensureMinWorkers();
	              }
	            } else {
	              availableWorker.status = _WorkerStatusEnum2.default.IDLE;
	            }
	            _this._runQueuedTask(); // trigger next task in the queue
	          });
	        }
	      }
	    }
	  }, {
	    key: '_ensureMinWorkers',
	    value: function _ensureMinWorkers() {
	      for (var i = this.workers.length; i < this.config.minWorkers; i++) {
	        this.register();
	      }
	    }
	  }, {
	    key: 'register',
	
	
	    /**
	     * Register a new worker. Config has to be passed with some required keys
	     * @return {Object} worker
	     */
	    value: function register() {
	      var config = this.config;
	
	      if (!config) {
	        throw new Error(_WarningTextEnum2.default.CONFIG_REQUIRED);
	      }
	
	      var url = config.url;
	
	      if (!url) {
	        throw new Error(_WarningTextEnum2.default.URL_REQUIRED);
	      }
	
	      var worker = new _RegisterWorker2.default(config);
	
	      return worker;
	    }
	  }, {
	    key: 'init',
	
	
	    /**
	     * Invoked on object instantiation unless user pass a key to call it explicitly
	     */
	    value: function init() {
	      if (!_worker2.default._isWebWorkerSupported()) {
	        console.warn(_WarningTextEnum2.default.WORKER_NOT_SUPPORTED);
	        return;
	      }
	
	      this.taskQueue = _TaskQueue2.default;
	      this.taskQueue.tasks = [];
	      this.taskQueue.allTasks = [];
	    }
	  }]);
	
	  return MainThread;
	}();
	
	;
	
	exports.default = MainThread;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _uuid = __webpack_require__(4);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	var _TaskQueue = __webpack_require__(5);
	
	var _TaskQueue2 = _interopRequireDefault(_TaskQueue);
	
	var _worker = __webpack_require__(8);
	
	var _worker2 = _interopRequireDefault(_worker);
	
	var _generalUtils = __webpack_require__(9);
	
	var _generalUtils2 = _interopRequireDefault(_generalUtils);
	
	var _TaskStatusEnum = __webpack_require__(7);
	
	var _TaskStatusEnum2 = _interopRequireDefault(_TaskStatusEnum);
	
	var _WorkerStatusEnum = __webpack_require__(11);
	
	var _WorkerStatusEnum2 = _interopRequireDefault(_WorkerStatusEnum);
	
	var _WorkerActionEnum = __webpack_require__(12);
	
	var _WorkerActionEnum2 = _interopRequireDefault(_WorkerActionEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// Named Class expression
	var RegisterWorker = function () {
	  /**
	   * Invoked when the object is instantiated
	   */
	  function RegisterWorker(config) {
	    _classCallCheck(this, RegisterWorker);
	
	    this.init(config);
	  }
	
	  _createClass(RegisterWorker, [{
	    key: 'onError',
	
	    // reject all running tasks on worker error
	    value: function onError(error) {
	      var _this = this;
	
	      this.status = _WorkerStatusEnum2.default.TERMINATED;
	      var activeTasks = _TaskQueue2.default.getActive(),
	          activeTasksRunningOnWorker = [];
	
	      if (activeTasks && activeTasks.length) {
	        activeTasksRunningOnWorker = activeTasks.filter(function (task) {
	          return task.runningOnWorkerId === _this.id;
	        });
	      }
	
	      for (var i = 0; i < activeTasksRunningOnWorker.length; i++) {
	        activeTasksRunningOnWorker[i].resolver.reject(error);
	      }
	
	      return activeTasksRunningOnWorker;
	    }
	  }, {
	    key: 'addEventListeners',
	
	
	    /**
	    * Attach postmessage, native and custom listeners to the window
	    */
	    value: function addEventListeners() {
	      var _this2 = this;
	
	      this.worker.addEventListener('message', this.onWorkerMessage.bind(this), false);
	      // listen for worker messages error
	      this.worker.addEventListener('error', this.onError.bind(this));
	      // listen for worker messages exit
	      this.worker.addEventListener('exit', function () {
	        var error = new Error('Worker terminated unexpectedly');
	
	        _this2.onError(error).bind(_this2);
	      });
	    }
	  }, {
	    key: 'onWorkerMessage',
	    value: function onWorkerMessage(ev) {
	      if (!ev || !ev.data || ev.data.action !== _WorkerActionEnum2.default.EXEC) {
	        return false;
	      }
	
	      var task = _TaskQueue2.default._getCompleted(ev.data.taskId);
	
	      if (ev.data.error) {
	        if (task.resolver && typeof task.resolver.reject === 'function') {
	          task.resolver.reject(_generalUtils2.default.deSerializeError(ev.data.error));
	        }
	        this.totalJobsFailed += 1;
	        this.lastJobFaileddAt = +new Date();
	        task.status = _TaskStatusEnum2.default.FAILED;
	        task.output = _TaskStatusEnum2.default.FAILED;
	        if (task.onError && typeof task.onError === 'function') {
	          task.onError();
	        }
	        return false;
	      }
	      if (task.resolver && typeof task.resolver.resolve === 'function') {
	        task.resolver.resolve(ev.data.result);
	      }
	      this.totalJobsCompleted += 1;
	      this.lastJobCompletedAt = +new Date();
	      task.status = _TaskStatusEnum2.default.COMPLETED;
	      task.output = ev.data.result;
	      if (task.onSuccess && typeof task.onSuccess === 'function') {
	        task.onSuccess();
	      }
	      return true;
	    }
	  }, {
	    key: 'init',
	
	    /**
	     * Open a new tab
	     * @param  {Object} config - Refer API for config keys
	     * @return {Object} this
	     */
	    value: function init(config) {
	      config = config || {};
	
	      _extends(this, config);
	      this.id = _uuid2.default.generate() || _worker2.default.workers.length + 1;
	      this.status = _WorkerStatusEnum2.default.IDLE;
	      this.createdAt = +new Date();
	      this.lastJobCompletedAt = null;
	      this.totalJobsCompleted = 0;
	      this.totalJobsFailed = 0;
	
	      this.worker = new Worker(config.url);
	
	      _worker2.default.sendMessage(this.worker, {
	        id: this.id,
	        action: _WorkerActionEnum2.default.READY,
	        message: 'Worker is ready.'
	      });
	
	      // TODO: only add methods which are needed
	      _extends(this.worker, {
	        sendMessage: _worker2.default.sendMessage
	      });
	
	      // Add Worker event-listeners
	      this.addEventListeners();
	
	      // Push it to the list of workers
	      _worker2.default.addNew(this);
	
	      // Return reference for chaining purpose
	      return this;
	    }
	  }]);
	
	  return RegisterWorker;
	}();
	
	;
	
	exports.default = RegisterWorker;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * UUID.js: The RFC-compliant UUID generator for JavaScript.
	 * ES6 port of only `generate` method of UUID by Varun Malhotra under MIT License
	 *
	 * @author  LiosK
	 * @version v3.3.0
	 * @license The MIT License: Copyright (c) 2010-2016 LiosK.
	 */
	
	/** @constructor */
	var UUID = void 0;
	
	UUID = function () {
	  'use strict';
	
	  /** @lends UUID */
	
	  function UUID() {}
	
	  /**
	   * The simplest function to get an UUID string.
	   * @returns {string} A version 4 UUID string.
	   */
	  UUID.generate = function () {
	    var rand = UUID._getRandomInt,
	        hex = UUID._hexAligner;
	
	    // ["timeLow", "timeMid", "timeHiAndVersion", "clockSeqHiAndReserved", "clockSeqLow", "node"]
	    return hex(rand(32), 8) + // time_low
	    '-' + hex(rand(16), 4) + // time_mid
	    '-' + hex(0x4000 | rand(12), 4) + // time_hi_and_version
	    '-' + hex(0x8000 | rand(14), 4) + // clock_seq_hi_and_reserved clock_seq_low
	    '-' + hex(rand(48), 12); // node
	  };
	
	  /**
	   * Returns an unsigned x-bit random integer.
	   * @param {int} x A positive integer ranging from 0 to 53, inclusive.
	   * @returns {int} An unsigned x-bit random integer (0 <= f(x) < 2^x).
	   */
	  UUID._getRandomInt = function (x) {
	    if (x < 0) {
	      return NaN;
	    }
	    if (x <= 30) {
	      return 0 | Math.random() * (1 << x);
	    }
	    if (x <= 53) {
	      return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
	    }
	
	    return NaN;
	  };
	
	  /**
	   * Returns a function that converts an integer to a zero-filled string.
	   * @param {int} radix
	   * @returns {function(num&#44; length)}
	   */
	  UUID._getIntAligner = function (radix) {
	    return function (num, length) {
	      var str = num.toString(radix),
	          i = length - str.length,
	          z = '0';
	
	      for (; i > 0; i >>>= 1, z += z) {
	        if (i & 1) {
	          str = z + str;
	        }
	      }
	      return str;
	    };
	  };
	
	  UUID._hexAligner = UUID._getIntAligner(16);
	
	  /**
	   * Returns UUID string representation.
	   * @returns {string} {@link UUID#hexString}.
	   */
	  UUID.prototype.toString = function () {
	    return this.hexString;
	  };
	
	  return UUID;
	}(UUID);
	
	exports.default = UUID;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _uuid = __webpack_require__(4);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	var _array = __webpack_require__(6);
	
	var _array2 = _interopRequireDefault(_array);
	
	var _TaskStatusEnum = __webpack_require__(7);
	
	var _TaskStatusEnum2 = _interopRequireDefault(_TaskStatusEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var TaskQueue = {
	  config: {},
	  tasks: [],
	  allTasks: [],
	
	  /**
	   * Add task to the queue
	   * @param {Object} task - with proper config
	   */
	  _add: function _add(task) {
	    if (!task) {
	      throw new Error('No task passed for queuing');
	    }
	
	    if (Object.prototype.toString.call(task) !== '[object Object]') {
	      throw new Error('Task should be an object');
	    }
	
	    task.id = _uuid2.default.generate() || TaskQueue.tasks.length;
	    task.status = _TaskStatusEnum2.default.QUEUED;
	    task.output = _TaskStatusEnum2.default.PENDING;
	    TaskQueue.tasks.push(task);
	    TaskQueue._addToAllList(task);
	  },
	  _addToAllList: function _addToAllList(task) {
	    if (!task) {
	      throw new Error('No task passed for queuing');
	    }
	
	    if (Object.prototype.toString.call(task) !== '[object Object]') {
	      throw new Error('Task should be an object');
	    }
	
	    TaskQueue.allTasks.push(task);
	  },
	  /**
	   * Remove a task from the queue
	   * @param {Number} task
	   */
	  _remove: function _remove(id) {
	    if (!id) {
	      throw new Error('No id passed');
	    }
	
	    var index = void 0;
	
	    index = _array2.default.searchByKeyName(TaskQueue.tasks, 'id', id, 'index');
	    if (index !== -1) {
	      TaskQueue.tasks.splice(index, 1);
	    }
	
	    return undefined;
	  },
	  _getCompleted: function _getCompleted(id) {
	    if (!id) {
	      throw new Error('No id passed');
	    }
	
	    var task = _array2.default.searchByKeyName(TaskQueue.allTasks, 'id', id);
	
	    return task || {};
	  },
	  /**
	   * Get the task from the queue
	   * @param {id} task
	   * @return {Object} task being queried or an empty Object(if not found)
	   */
	  get: function get(id) {
	    if (!id) {
	      return TaskQueue.tasks[0] || {};
	    }
	
	    var task = _array2.default.searchByKeyName(TaskQueue.tasks, 'id', id);
	
	    return task || {};
	  },
	  /**
	   * Get next available task from the queue
	   * @return {Object} task being queried or an empty Object(if not found)
	   */
	  getNextTask: function getNextTask() {
	    // Sort as per task priorities
	    _array2.default.sortOnStringType(TaskQueue.tasks, 'priority');
	    return TaskQueue.get();
	  },
	  /**
	   * Filter out all the active tasks
	   * @return {Array} - only the active tasks
	   */
	  getActive: function getActive() {
	    return TaskQueue.tasks.filter(function (task) {
	      return task.status === _TaskStatusEnum2.default.ACTIVE;
	    });
	  },
	  /**
	   * Filter out all the completed tasks
	   * @return {Array} - only the completed tasks
	   */
	  getCompleted: function getCompleted() {
	    return TaskQueue.tasks.filter(function (task) {
	      return task.status === _TaskStatusEnum2.default.COMPLETED;
	    });
	  },
	  /**
	   * Filter out all the failed tasks
	   * @return {Array} - only the failed tasks
	   */
	  getFailed: function getFailed() {
	    return TaskQueue.tasks.filter(function (task) {
	      return task.status === _TaskStatusEnum2.default.FAILED;
	    });
	  },
	  /**
	   * To get list of all tasks
	   * @return {Array} - list of all tasks
	   */
	  getAll: function getAll() {
	    return TaskQueue.tasks;
	  }
	};
	
	exports.default = TaskQueue;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ArrayUtils = {};
	
	/**
	 * Different type of data needed after searching an item(Object) within data(Array of Objects).
	 * 1. `INDEX` returns just the index at which the item was present
	 * 2. `OBJECT` returns the matched object
	 * 3. `BOTH` returns an object { obj: matched_object, index: index_found }
	 */
	var returnPreferenceEnum = {
	  INDEX: 'index',
	  OBJECT: 'object',
	  BOTH: 'both'
	};
	
	/**
	 * Search for an item(Object) within a data-set(Array Of Objects)
	 * @param  {Array of Objects} data
	 * @param  {String} key - Unique key to search on the basis of
	 * @param  {String} value - The matching criteria
	 * @param  {String} returnPreference - what kind of output is needed
	 * @return {Object}
	 */
	ArrayUtils.searchByKeyName = function (data, key, value, returnPreference) {
	  if (!data || !key) {
	    return false;
	  }
	
	  returnPreference = returnPreference || returnPreferenceEnum[1]; // default to Object
	  var i = void 0,
	      obj = void 0,
	      returnData = void 0,
	      index = -1;
	
	  for (i = 0; i < data.length; i++) {
	    obj = data[i];
	    // Number matching support
	    if (!isNaN(value) && obj && parseInt(obj[key], 10) === parseInt(value, 10)) {
	      index = i;
	      break;
	    } else if (isNaN(value) && obj && obj[key] === value) {
	      // String exact matching support
	      index = i;
	      break;
	    }
	  }
	
	  if (index === -1) {
	    // item not found
	    data[index] = {}; // for consistency
	  }
	
	  switch (returnPreference) {
	    case returnPreferenceEnum.INDEX:
	      returnData = index;
	      break;
	    case returnPreferenceEnum.BOTH:
	      returnData = {
	        obj: data[index],
	        index: index
	      };
	      break;
	    case returnPreferenceEnum.OBJECT:
	    default:
	      returnData = data[index];
	      break;
	  }
	
	  return returnData;
	};
	
	/**
	 * Sort array based on key defined.
	 * @param {Array} arr - Array to be sorted
	 * @param {String} key - key on which sort is required
	 * @param {Boolean} orederBy - Sort in asc/desc order. If nothing is specified, it's ascending order.
	 */
	ArrayUtils.sortOn = function (arr, key, orderBy) {
	  arr.sort(function (a, b) {
	    return orderBy ? b[key] - a[key] : a[key] - b[key];
	  });
	};
	
	/**
	 * Sort array based on key:String defined.
	 * @param {Array} arr - Array to be sorted
	 * @param {String} key - key on which sort is required
	 * @param {Boolean} orederBy - Sort in asc/desc order. If nothing is specified, it's ascending order.
	 */
	ArrayUtils.sortOnStringType = function (arr, key) {
	  arr.sort(function (a, b) {
	    if (a[key] < b[key]) {
	      return -1;
	    } else if (a[key] > b[key]) {
	      return 1;
	    }
	    return 0;
	  });
	};
	
	exports.default = ArrayUtils;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Enum for Worker status(still active / idle) used for client-worker-communication
	 * @type {Object}
	 */
	var TaskStatusEnum = {
	  PENDING: 'pending',
	  QUEUED: 'queued',
	  ACTIVE: 'active',
	  FAILED: 'failed',
	  COMPLETED: 'completed'
	};
	
	exports.default = TaskStatusEnum;
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                                               * A Tab utility file to deal with tab operations
	                                                                                                                                                                                                                                                                               */
	
	
	var _Promise = __webpack_require__(1);
	
	var _Promise2 = _interopRequireDefault(_Promise);
	
	var _array = __webpack_require__(6);
	
	var _array2 = _interopRequireDefault(_array);
	
	var _generalUtils = __webpack_require__(9);
	
	var _generalUtils2 = _interopRequireDefault(_generalUtils);
	
	var _WorkerStatusEnum = __webpack_require__(11);
	
	var _WorkerStatusEnum2 = _interopRequireDefault(_WorkerStatusEnum);
	
	var _WarningTextEnum = __webpack_require__(10);
	
	var _WarningTextEnum2 = _interopRequireDefault(_WarningTextEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var WorkerUtils = {
	  workers: [],
	  config: {},
	
	  /**
	   * Check is worker is present on window
	   * @return {Boolean} [description]
	   */
	  _isWebWorkerSupported: function _isWebWorkerSupported() {
	    if (typeof window.Worker === 'function' || _typeof(window.Worker) === 'object' || typeof Worker.prototype.constructor === 'function') {
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
	  _remove: function _remove(worker) {
	    var index = void 0;
	
	    index = _array2.default.searchByKeyName(WorkerUtils.workers, 'id', worker.id, 'index');
	    WorkerUtils.workers.splice(index, 1);
	  },
	
	  /**
	   * Add a new worker to the Array of workers
	   * @param  {Object} worker
	   * @return {Object} - this
	   */
	  addNew: function addNew(worker) {
	    WorkerUtils.workers.push(worker);
	    return undefined;
	  },
	  /**
	   * Filter out all the active workers
	   * @return {Array} - only the active workers
	   */
	  getActive: function getActive() {
	    return WorkerUtils.workers.filter(function (worker) {
	      return worker.status === _WorkerStatusEnum2.default.ACTIVE;
	    });
	  },
	  /**
	   * Filter out all the idle workers
	   * @return {Array} - only the idle workers
	   */
	  getIdle: function getIdle() {
	    return WorkerUtils.workers.filter(function (worker) {
	      return worker.status === _WorkerStatusEnum2.default.IDLE;
	    });
	  },
	  /**
	   * Filter out all the terminated workers
	   * @return {Array} - only the idle workers
	   */
	  getTerminated: function getTerminated() {
	    return WorkerUtils.workers.filter(function (worker) {
	      return worker.status === _WorkerStatusEnum2.default.TERMINATED;
	    });
	  },
	  /**
	   * To get list of all workers(idle/active).
	   * Note: idle workers will not be returned if `removeidleworkers` key is paased while instantiaiting Parent.
	   * @return {Array} - list of all workers
	   */
	  getAll: function getAll() {
	    return WorkerUtils.workers;
	  },
	
	  /**
	   * Terminate a specific tab
	   * @param  {String} id
	   * @return {Object} this
	   */
	  terminate: function terminate(id) {
	    if (!id) {
	      console.warn(_WarningTextEnum2.default.NO_ID_PROVIDED);
	      return WorkerUtils;
	    }
	
	    var worker = _array2.default.searchByKeyName(WorkerUtils.workers, 'id', id, 'object');
	
	    if (worker && worker.worker && worker.status === _WorkerStatusEnum2.default.TERMINATED) {
	      console.warn(_WarningTextEnum2.default.WORKER_ALREADY_TERMINATED);
	      return WorkerUtils;
	    }
	
	    if (worker && worker.worker && worker.worker.terminate) {
	      worker.worker.terminate();
	      worker.status = _WorkerStatusEnum2.default.TERMINATED;
	    }
	
	    return WorkerUtils;
	  },
	  /**
	   * Terminate all (active+idle) workers using a native method `Terminate` available on window.open reference.
	   * @return {WorkerUtils} this
	   */
	  terminateAllExceptOne: function terminateAllExceptOne(minWorkers) {
	    return WorkerUtils.terminateAll(true, minWorkers || 1);
	  },
	  /**
	   * Terminate all active workers using a native method `Terminate` available on window.open reference.
	   * @return {WorkerUtils} this
	   */
	  terminateAll: function terminateAll(exceptOne, minWorkers) {
	    var i = void 0,
	        nonTerminatedWorkers = void 0;
	
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
	
	      if (nonTerminatedWorkers[i] && nonTerminatedWorkers[i].worker && nonTerminatedWorkers[i].worker.terminate) {
	        nonTerminatedWorkers[i].worker.terminate();
	        nonTerminatedWorkers[i].status = _WorkerStatusEnum2.default.TERMINATED;
	      }
	    }
	
	    return WorkerUtils;
	  },
	  /**
	   * Send a postmessage to every active Child tab(excluding itself i.e Parent Tab)
	   * @param  {String} config
	   */
	  broadCastAll: function broadCastAll(config) {
	    var i = void 0,
	        workers = WorkerUtils.getActive() || [];
	
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
	  broadCastTo: function broadCastTo(id, config) {
	    var targetedWorker = void 0,
	        workers = [].concat(WorkerUtils.getActive()).concat(WorkerUtils.getIdle());
	
	    targetedWorker = _array2.default.searchByKeyName(workers, 'id', id);
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
	  sendMessage: function sendMessage(target, config) {
	    var msg = void 0,
	        isEncodedMethod = false;
	
	    config = config || {};
	    if (config.method && typeof config.method === 'function') {
	      config.method = _generalUtils2.default.serializeFunction(config.method);
	      isEncodedMethod = true;
	    }
	
	    if (!config.resolver) {
	      config.resolver = _Promise2.default.defer();
	    }
	
	    msg = {
	      id: config.id,
	      taskId: config.taskId,
	      method: config.method,
	      params: config.params,
	      action: config.action,
	      isEncodedMethod: isEncodedMethod
	    };
	
	    msg = _generalUtils2.default.stringifyJson(msg);
	
	    if (target && target.postMessage) {
	      target.postMessage(msg);
	    }
	
	    return config.resolver.promise;
	  }
	};
	
	exports.default = WorkerUtils;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _WarningTextEnum = __webpack_require__(10);
	
	var _WarningTextEnum2 = _interopRequireDefault(_WarningTextEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var GeneralUtils = {
	  isPromise: function isPromise(value) {
	    return value && typeof value.then === 'function';
	  },
	  serializeFunction: function serializeFunction(fn) {
	    if (!fn || typeof fn !== 'function') {
	      return false;
	    }
	
	    return encodeURI(fn.toString());
	  },
	  deSerializeFunction: function deSerializeFunction(fn) {
	    if (!fn || typeof fn !== 'string') {
	      return false;
	    }
	
	    return decodeURI(fn);
	  },
	  serializeError: function serializeError(error) {
	    var i = void 0,
	        err = {},
	        errProps = ['name', 'message', 'stack', 'custom'];
	
	    if (error instanceof Error) {
	      for (i = errProps.length - 1; i >= 0; i--) {
	        err[errProps[i]] = error[errProps[i]];
	      }
	      return err;
	    }
	
	    return err;
	  },
	  deSerializeError: function deSerializeError(error) {
	    var i = void 0,
	        fakeError = new Error('');
	
	    if (!error) {
	      return fakeError;
	    }
	
	    var props = Object.keys(error);
	
	    for (i = 0; i < props.length; i++) {
	      fakeError[props[i]] = error[props[i]];
	    }
	
	    return fakeError;
	  },
	  /**
	   * Stringify Object
	   * @param  {String} data
	   * @param  {String} err  - Message to be thrown if not valid object
	   * @return {Object}      - stringified json
	   */
	  stringifyJson: function stringifyJson(data, err) {
	    err = err || _WarningTextEnum2.default.INVALID_JSON;
	    try {
	      data = JSON.stringify(data);
	    } catch (e) {
	      console.warn(err);
	    }
	
	    return data;
	  },
	  /**
	   * Parse sringified data
	   * @param  {String} data
	   * @param  {String} err  - Message to be thrown if not valid json
	   * @return {Object}      - parsed json
	   */
	  parseJson: function parseJson(data, err) {
	    var jsonParsedData = void 0;
	
	    err = err || _WarningTextEnum2.default.PARSE_JSON;
	    try {
	      jsonParsedData = JSON.parse(data);
	    } catch (e) {
	      console.warn(err);
	    }
	
	    return jsonParsedData;
	  }
	};
	
	exports.default = GeneralUtils;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Enum for showing various warnings to suser when things done wrong
	 * @type {Object}
	 */
	var WarningTextEnum = {
	  INVALID_JSON: 'Invalid JSON Object!',
	  PARSE_JSON: 'Can not parse stringifed data',
	  NO_ID_PROVIDED: 'Valid worker id should be provided',
	  INVALID_DATA: 'Some wrong message is being sent by Parent.',
	  WORKER_ALREADY_TERMINATED: 'Web Worker has already been terminated.',
	  CONFIG_REQUIRED: 'Configuration options required. Please read docs.',
	  WORKER_NOT_SUPPORTED: 'Web Worker not supported on this browser version',
	  URL_REQUIRED: 'Url is needed for creating and opening a new window/tab. Please read docs.'
	};
	
	exports.default = WarningTextEnum;
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Enum for Worker status(still active / idle) used for client-worker-communication
	 * @type {Object}
	 */
	var WorkerStatusEnum = {
	  IDLE: 'idle',
	  ACTIVE: 'active',
	  TERMINATED: 'terminated'
	};
	
	exports.default = WorkerStatusEnum;
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Enum for Worker action
	 * @type {Object}
	 */
	var WorkerActionEnum = {
	  READY: 'ready',
	  EXEC: 'execute'
	};
	
	exports.default = WorkerActionEnum;
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _generalUtils = __webpack_require__(9);
	
	var _generalUtils2 = _interopRequireDefault(_generalUtils);
	
	var _WorkerActionEnum = __webpack_require__(12);
	
	var _WorkerActionEnum2 = _interopRequireDefault(_WorkerActionEnum);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// Named Class expression
	var WorkerThread = function () {
	  /**
	   * Involed when object is instantiated
	   * Set flags/variables and calls init method to attach event listeners
	   * @param  {Object} config - Refer API/docs for config keys
	   */
	  function WorkerThread(config) {
	    _classCallCheck(this, WorkerThread);
	
	    if (!config) {
	      config = {};
	    }
	
	    _extends(this, config);
	    this.config = config;
	
	    this.methods = {};
	    if (!config.unlistenEvents) {
	      this.addListeners();
	    }
	  }
	
	  _createClass(WorkerThread, [{
	    key: 'sendMessage',
	    value: function sendMessage(obj, origin) {
	      if (origin) {
	        postMessage(obj, origin);
	      } else {
	        postMessage(obj);
	      }
	    }
	  }, {
	    key: 'exposeMethods',
	    value: function exposeMethods(methods) {
	      if (!methods || Object.prototype.toString.call(methods) !== '[object Object]') {
	        throw new Error('ExposeMethods function expects object');
	      }
	
	      for (var method in methods) {
	        var fn = methods[method];
	
	        if (methods.hasOwnProperty(method) && typeof fn === 'function') {
	          this.methods[method] = fn;
	        }
	      }
	    }
	  }, {
	    key: 'onMessage',
	    value: function onMessage(ev) {
	      var _this = this;
	
	      var result = void 0,
	          messageData = void 0;
	
	      messageData = _generalUtils2.default.parseJson(ev.data) || {};
	      if (messageData && messageData.action === _WorkerActionEnum2.default.EXEC) {
	        if (messageData.method) {
	          var _params = messageData.params;
	
	          try {
	            var _fn = void 0,
	                method = void 0;
	
	            if (messageData.isEncodedMethod) {
	              _fn = _generalUtils2.default.deSerializeFunction(messageData.method);
	            } else {
	              _fn = this.methods[messageData.method];
	            }
	
	            method = eval('(' + _fn + ')'); // eslint-disable-line
	
	            result = method.apply(method, _params);
	            if (_generalUtils2.default.isPromise(result)) {
	              result.then(function (thenResult) {
	                _this.sendMessage({
	                  id: messageData.id,
	                  taskId: messageData.taskId,
	                  action: messageData.action,
	                  result: thenResult,
	                  error: null
	                }, ev.origin);
	              }).catch(function (e) {
	                _this.sendMessage({
	                  id: messageData.id,
	                  taskId: messageData.taskId,
	                  action: messageData.action,
	                  result: null,
	                  error: _generalUtils2.default.serializeError(e)
	                }, ev.origin);
	              });
	            } else {
	              this.sendMessage({
	                id: messageData.id,
	                taskId: messageData.taskId,
	                action: messageData.action,
	                result: result,
	                error: null
	              }, ev.origin);
	            }
	          } catch (e) {
	            this.sendMessage({
	              id: messageData.id,
	              taskId: messageData.taskId,
	              action: messageData.action,
	              result: null,
	              error: _generalUtils2.default.serializeError(e)
	            }, ev.origin);
	          }
	        }
	      } else {
	        this.sendMessage({
	          id: messageData.id,
	          taskId: messageData.taskId,
	          action: messageData.action
	        }, ev.origin);
	      }
	    }
	
	    /**
	     * Attach sendmessage and onbeforeunload event listeners
	     */
	
	  }, {
	    key: 'addListeners',
	    value: function addListeners() {
	      removeEventListener('message', this.onMessage.bind(this));
	      addEventListener('message', this.onMessage.bind(this));
	    }
	  }]);
	
	  return WorkerThread;
	}();
	
	;
	
	exports.default = WorkerThread;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=super-workers.js.map