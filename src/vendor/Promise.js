/**
 * Inspired from - @josdejong(Github) - Promise.js
 *
 * ES6 port
 *
 * Promise polyfill
 *
 * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
 */
class Promise {
	constructor(handler) {
		const self = this;
		let _resolve, _reject, _process;

		/**
     * Create a cancellation error
     * @param {String} [message]
     * @extends Error
     */
		function CancellationError(message) {
			this.message = message || 'promise cancelled';
			this.stack = (new Error()).stack;
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
			this.stack = (new Error()).stack;
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
    this['catch'] = function (onFail) {  // eslint-disable-line
			return this.then(null, onFail);
		};

		if (!(this instanceof Promise)) {
			throw new SyntaxError('Constructor must be called with the new operator');
		}

		if (typeof handler !== 'function') {
			throw new SyntaxError('Function parameter handler(resolve, reject) missing');
		}

		const _onSuccess = [];
		const _onFail = [];

		/**
     * Process onSuccess and onFail callbacks: add them to the queue.
     * Once the promise is resolve, the function _promise is replace.
     * @param {Function} onSuccess
     * @param {Function} onFail
     * @private
     */
		_process = (onSuccess, onFail) => {
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
			return result => {
				try {
					const res = callback(result);

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
		this.then = (onSuccess, onFail) => new Promise((resolve, reject) => {
			const s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
			const f = onFail ? _then(onFail, resolve, reject) : reject;

			_process(s, f);
		}, self);

		/**
     * Resolve the promise
     * @param {*} result
     * @type {Function}
     */
		_resolve = result => {
			_onSuccess.forEach(fn => {
				fn(result);
			});

			_process = (onSuccess, onFail) => {
				onSuccess(result);
			};

			_resolve = _reject = () => {
				throw new Error('Promise is already resolved');
			};

			return self;
		};

		/**
     * Reject the promise
     * @param {Error} error
     * @type {Function}
     */
		_reject = error => {
			_onFail.forEach(fn => {
				fn(error);
			});

			_process = (onSuccess, onFail) => {
				onFail(error);
			};

			_resolve = _reject = () => {
				throw new Error('Promise is already resolved');
			};

			return self;
		};

		/**
     * Cancel te promise. This will reject the promise with a CancellationError
     * @returns {Promise} self
     */
		this.cancel = () => {
			_reject(new CancellationError());

			return self;
		};

		/**
     * Set a timeout for the promise. If the promise is not resolved within
     * the time, the promise will be cancelled and a TimeoutError is thrown.
     * If the promise is resolved in time, the timeout is removed.
     * @param {number} delay     Delay in milliseconds
     * @returns {Promise} self
     */
		this.timeout = delay => {
			const timer = setTimeout(() => {
				_reject(new TimeoutError(`Promise timed out after ${delay} ms`));
			}, delay);

			self.always(() => {
				clearTimeout(timer);
			});

			return self;
		};

		// attach handler passing the resolve and reject functions
		handler(result => {
			_resolve(result);
		}, error => {
			_reject(error);
		});
	}

	// TODO: add support for Promise.catch(Error, callback)
	// TODO: add support for Promise.catch(Error, Error, callback)

	/**
   * Execute given callback when the promise either resolves or rejects.
   * @param {Function} fn
   * @returns {Promise} promise
   */
	always(fn) {
		return this.then(fn, fn);
	}

	/**
   * Create a promise which resolves when all provided promises are resolved,
   * and fails when any of the promises resolves.
   * @param {Promise[]} promises
   * @returns {Promise} promise
   */
	static all(promises) {
		return new Promise((resolve, reject) => {
			let remaining = promises.length;
			const results = [];

			if (remaining) {
				promises.forEach((p, i) => {
					p.then(result => {
						results[i] = result;
						remaining--;
						if (remaining === 0) {
							resolve(results);
						}
					}, error => {
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
	static defer() {
		const resolver = {};

		resolver.promise = new Promise((resolve, reject) => {
			resolver.resolve = resolve;
			resolver.reject = reject;
		});

		return resolver;
	}
}

export default Promise;
