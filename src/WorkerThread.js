import GeneralUtils from './utils/generalUtils';
import WorkerActionEnum from './enums/WorkerActionEnum';

// Named Class expression
class WorkerThread {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    if (!config) {
      config = {};
    }

    Object.assign(this, config);
    this.config = config;

    this.methods = {};
    if (!config.unlistenEvents) {
      this.addListeners();
    }
  };

  sendMessage(obj, origin) {
    if (origin) {
      postMessage(obj, origin); // eslint-disable-line no-undef
    } else {
      postMessage(obj); // eslint-disable-line no-undef
    }
  };

  exposeMethods(methods) {
    if (!methods || Object.prototype.toString.call(methods) !== '[object Object]') {
      throw new Error('ExposeMethods function expects object');
    }

    for (let method in methods) {
      let fn = methods[method];

      if (methods.hasOwnProperty(method) && typeof fn === 'function') {
        this.methods[method] = fn;
      }
    }
  }

  onMessage(ev) {
    let result, messageData;

    messageData = GeneralUtils.parseJson(ev.data) || {};
    if (messageData && messageData.action === WorkerActionEnum.EXEC) {
      if (messageData.method) {
        let _params = messageData.params;

        try {
          let _fn, method;

          if (messageData.isEncodedMethod) {
            _fn = GeneralUtils.deSerializeFunction(messageData.method);
          } else {
            _fn = this.methods[messageData.method];
          }

          method = eval('(' + _fn + ')'); // eslint-disable-line

          result = method.apply(method, _params);
          if (GeneralUtils.isPromise(result)) {
            result.then((thenResult) => {
              this.sendMessage({
                id: messageData.id,
                taskId: messageData.taskId,
                action: messageData.action,
                result: thenResult,
                error: null
              }, ev.origin);
            })
              .catch((e) => {
                this.sendMessage({
                  id: messageData.id,
                  taskId: messageData.taskId,
                  action: messageData.action,
                  result: null,
                  error: GeneralUtils.serializeError(e)
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
            error: GeneralUtils.serializeError(e)
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
  addListeners() {
    removeEventListener('message', this.onMessage.bind(this)); // eslint-disable-line no-undef
    addEventListener('message', this.onMessage.bind(this)); // eslint-disable-line no-undef
  };

  /**
   * API starts here ->
   */

  /**
   * API ends here ->
   */
};

export default WorkerThread;
