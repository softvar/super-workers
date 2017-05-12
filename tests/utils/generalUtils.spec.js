import GeneralUtils from '../../src/utils/generalUtils';

import Promise from '../../src/vendor/Promise';
import WarningTextEnum from '../../src/enums/WarningTextEnum';

describe('GeneralUtils', () => {
	describe('Basic tests', () => {
		it('verify it is defined and its methods', () => {
			expect(GeneralUtils).toBeDefined();
			expect(GeneralUtils.isPromise).toBeDefined();
			expect(GeneralUtils.serializeFunction).toBeDefined();
			expect(GeneralUtils.deSerializeFunction).toBeDefined();
			expect(GeneralUtils.serializeError).toBeDefined();
			expect(GeneralUtils.deSerializeError).toBeDefined();
			expect(GeneralUtils.stringifyJson).toBeDefined();
			expect(GeneralUtils.parseJson).toBeDefined();
		});
	});

	describe('method: isPromise', () => {
		it('should return false if no value passed', () => {
			expect(GeneralUtils.isPromise()).toBeUndefined();
		});
		it('should return false if no then method on value', () => {
			expect(GeneralUtils.isPromise({})).toBe(false);
		});
		it('should return true if value is an actual promise', () => {
			let p = Promise.defer();

			expect(GeneralUtils.isPromise(p.promise)).toBe(true);
		});
		it('should return true if object has thenable function', () => {
			let p = {
				then: function () {}
			};

			expect(GeneralUtils.isPromise(p)).toBe(true);
		});
	});

	describe('method: serializeFunction', () => {
		it('should return if no function is passed', () => {
			spyOn(window, 'encodeURI');
			GeneralUtils.serializeFunction();
			expect(window.encodeURI).not.toHaveBeenCalled();
		});
		it('should return if passed argument is not of function type', () => {
			spyOn(window, 'encodeURI');
			GeneralUtils.serializeFunction({test: 'me'});
			expect(window.encodeURI).not.toHaveBeenCalled();
		});
		it('should call encodeURI on passing valid fn', () => {
			spyOn(window, 'encodeURI');
			let fn = function a() { };

			GeneralUtils.serializeFunction(fn);
			expect(window.encodeURI).toHaveBeenCalledWith(fn.toString());
		});
	});

	describe('method: deSerializeFunction', () => {
		it('should return if no function is passed', () => {
			spyOn(window, 'decodeURI');
			GeneralUtils.deSerializeFunction();
			expect(window.decodeURI).not.toHaveBeenCalled();
		});
		it('should return if passed argument is not of function type', () => {
			spyOn(window, 'decodeURI');
			GeneralUtils.deSerializeFunction({test: 'me'});
			expect(window.decodeURI).not.toHaveBeenCalled();
		});
		it('should call decodeURI on passing valid fn', () => {
			spyOn(window, 'decodeURI');
			let fn = 'function%20add()%20%7B%20return%205;%7D';

			GeneralUtils.deSerializeFunction(fn);
			expect(window.decodeURI).toHaveBeenCalledWith(fn);
		});
	});

	describe('method: serializeError', () => {
		it('should serialize error to object', () => {
			let obj, error = new Error('Error !!');

			obj = GeneralUtils.serializeError(error);
			expect(obj).toEqual({
				custom: undefined,
				stack: undefined,
				message: 'Error !!',
				name: 'Error'
			});
		});
	});

	describe('method: deSerializeError', () => {
		it('should return an Error object if no error-object is passed', () => {
			let error = GeneralUtils.deSerializeError();

			expect(error instanceof Error).toBe(true);
			expect(Object.keys(error).length).toBe(0);
		});

		it('should deserialize obj to Error', () => {
			let obj = {
				custom: undefined,
				stack: undefined,
				message: 'Error !!',
				name: 'Error'
			};

			obj = GeneralUtils.deSerializeError(obj);

			expect(obj instanceof Error).toBe(true);

			expect(Object.keys(obj).length).toBe(3);

			expect(obj.hasOwnProperty('message')).toBe(true);
			expect(obj.hasOwnProperty('name')).toBe(true);
		});
	});

	describe('method: stringifyJson', () => {
		it('should stringify data if valid', () => {
			let obj = GeneralUtils.stringifyJson({
				name: 'Varun',
				handle: 'softvar',
				age: '24'
			});

			expect(obj).toEqual('{"name":"Varun","handle":"softvar","age":"24"}')
		});

		it('should warn if not able to stringify', () => {
			// TypeError: Converting circular structure to JSON
			let obj = {};
			obj.a = { b:obj };

			spyOn(console, 'warn');
			GeneralUtils.stringifyJson(obj);
			expect(console.warn).toHaveBeenCalledWith(WarningTextEnum.INVALID_JSON)
		});

		it('should warn with passed error, if not able to stringify', () => {
			// TypeError: Converting circular structure to JSON
			let errorMsg = 'Error parsing',
				obj = {};

			obj.a = { b:obj };

			spyOn(console, 'warn');

			GeneralUtils.stringifyJson(obj, errorMsg);

			expect(console.warn).toHaveBeenCalledWith(errorMsg);
		});
	});

	describe('method: parseJson', () => {
		it('should stringify data if valid', () => {
			let obj, str = '{"name":"Varun","handle":"softvar","age":"24"}';

			obj = GeneralUtils.parseJson(str);
			expect(obj).toEqual({
				name: 'Varun',
				handle: 'softvar',
				age: '24'
			});
		});

		it('should warn if not able to parse', () => {
			let str = '{name:Varun,handle:softvar,age:24}';

			spyOn(console, 'warn');
			GeneralUtils.parseJson(str);
			expect(console.warn).toHaveBeenCalledWith(WarningTextEnum.PARSE_JSON);
		});

		it('should warn with passed error, if not able to parse', () => {
			let errorMsg = 'Error parsing',
				str = '{name:Varun,handle:softvar,age:24}';

			spyOn(console, 'warn');
			GeneralUtils.parseJson(str, errorMsg);
			expect(console.warn).toHaveBeenCalledWith(errorMsg);
		});
	});

});
