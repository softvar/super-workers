import WarningTextEnum from '../enums/WarningTextEnum';

let GeneralUtils = {
	isPromise: (value) => {
		return value && (typeof value.then === 'function');
	},
	serializeFunction: (fn) => {
		if (!fn || typeof fn !== 'function') { return false; }

		return encodeURI(fn.toString());
	},
	deSerializeFunction: (fn) => {
		if (!fn || typeof fn !== 'string') { return false; }

		return decodeURI(fn);
	},
	serializeError: (error) => {
		let i;
		let err = {};
		let errProps = [ 'name', 'message', 'stack', 'custom' ];

		if (error instanceof Error) {
			for (i = errProps.length - 1; i >= 0; i--) {
				err[errProps[i]] = error[errProps[i]];
			}
			return err;
		}

		return err;
	},
	deSerializeError: (error) => {
		let i;
		let fakeError = new Error('');

		if (!error) {
			return fakeError;
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
