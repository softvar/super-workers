import WarningTextEnum from '../enums/WarningTextEnum';

let GeneralUtils = {
  isPromise: (value) => {
    return value && (typeof value.then === 'function');
  },
  serializeFunction: (fn) => {
    return encodeURI(fn.toString());
  },
  deSerializeFunction: (fn) => {
    return decodeURI(fn);
  },
  serializeError: (error) => {
    let i, err = {},
      errProps = [ 'name', 'message', 'stack', 'custom' ];

    if (error instanceof Error) {
      for (i = errProps.length - 1; i >= 0; i--) {
        err[errProps[i]] = error[errProps[i]];
      }
      return err;
    }

    return err;
  },
  deSerializeError: (error) => {
    let i, fakeError = new Error('');

    if (!error) {
      return new Error('');
    }

    let props = Object.keys(error);

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
  stringifyJson: function (data, err) {
    err = err || WarningTextEnum.INVALID_JSON;
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
  parseJson: function (data, err) {
    let jsonParsedData;

    err = err || WarningTextEnum.PARSE_JSON;
    try {
      jsonParsedData = JSON.parse(data);
    } catch (e) {
      console.warn(err);
    }

    return jsonParsedData;
  }
};

export default GeneralUtils;
