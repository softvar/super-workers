import WorkerThread from '../src/WorkerThread';

import GeneralUtils from '../src/utils/generalUtils';

let _fn = window.encodeURI(function add() { return 5; }),
	wt;

describe('WorkerThread', () => {
	beforeEach(() => {
		wt = new WorkerThread({
			unlistenEvents: true
		});
	});

	describe('Basic Tests', () => {
		it('should verify it is defined', () => {
			expect(WorkerThread).toBeDefined();
		});
	});

	describe('constructor', () => {
		it('should set default properties on object created', () => {
			expect(wt.methods).toEqual({});
		});

		it('should set passed config on object created', () => {
			wt = new WorkerThread({
				key: 'key',
				value: 'value',
				unlistenEvents: true
			});

			expect(Object.keys(wt.config).length).toEqual(3);
			expect(wt.config.key).toEqual('key');
			expect(wt.config.value).toEqual('value');
			expect(wt.methods).toEqual({});
		});
	});

	describe('method: exposeMethods', () => {
		it('should throw error if `methods` not passed', () => {
			expect(wt.exposeMethods).toThrow(new Error('ExposeMethods function expects object'));
		});
		it('should throw error if `methods` passed is not an Object', () => {
			expect(function () {
				wt.exposeMethods([])
			}).toThrow(new Error('ExposeMethods function expects object'));
			expect(function () {
				wt.exposeMethods('')
			}).toThrow(new Error('ExposeMethods function expects object'));
			expect(function () {
				wt.exposeMethods(123)
			}).toThrow(new Error('ExposeMethods function expects object'));
		});
		it('should add user passed methods on this.methods', () => {
			wt.exposeMethods({
				add: function () {},
				subtract: function () {},
				multiply: function () {}
			});

			expect(wt.methods.add).toBeDefined();
			expect(wt.methods.subtract).toBeDefined();
			expect(wt.methods.multiply).toBeDefined();
		});
		it('should add user passed methods on this.methods only if its a function', () => {
			wt.exposeMethods({
				add: function () {},
				subtract: '',
				multiply: ''
			});

			expect(wt.methods.add).toBeDefined();
			expect(wt.methods.subtract).not.toBeDefined();
			expect(wt.methods.multiply).not.toBeDefined();
		});
	});

	describe('method: addListeners', () => {
		it('should add message event listener', () => {
			spyOn(window, 'removeEventListener');
			spyOn(window, 'addEventListener');

			wt.addListeners();

			expect(window.removeEventListener).toHaveBeenCalled();
			expect(window.addEventListener).toHaveBeenCalled();
		});
	});

	describe('method: onMessage', function() {
		it('should try to parse incoming data', () => {
			spyOn(GeneralUtils, 'parseJson');
			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"ready"}'};

			wt.onMessage(evData);
			expect(GeneralUtils.parseJson).toHaveBeenCalledWith(evData.data)
		});
		it('should send message when the action is not `execute`', () => {
			spyOn(window, 'postMessage');

			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"ready"}'};

			wt.onMessage(evData);
			expect(window.postMessage).toHaveBeenCalledWith({
				id: 1,
				taskId: 2,
				action: 'ready'
			}, '*');
		});
		it('should not desrialize function if not encoded', () => {
			spyOn(GeneralUtils, 'deSerializeFunction');
			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"execute","method":"add"}'};

			wt.onMessage(evData);
			expect(GeneralUtils.deSerializeFunction).not.toHaveBeenCalledWith('add')
		});
		it('should desrialize function if encoded incoming data', () => {
			spyOn(GeneralUtils, 'deSerializeFunction');
			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"execute","method":"' + _fn + '","isEncodedMethod":true}'};

			wt.onMessage(evData);
			expect(GeneralUtils.deSerializeFunction).toHaveBeenCalledWith(_fn)
		});
		it('should check if the result is not a Promise, send according send msg', () => {
			spyOn(GeneralUtils, 'isPromise');
			spyOn(window, 'postMessage')
			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"execute","method":"' + _fn + '","isEncodedMethod":true}'};

			wt.onMessage(evData);
			expect(GeneralUtils.isPromise).toHaveBeenCalledWith(5);
			expect(window.postMessage).toHaveBeenCalledWith({
				id: 1,
				taskId: 2,
				action: 'execute',
				result: 5,
				error: null
			}, '*');
		});
		it('should check if the result is a Promise, send according send msg', () => {
			spyOn(GeneralUtils, 'isPromise');
			spyOn(window, 'postMessage');

			let _fn = window.encodeURI(function () {
					return { then: function () {} };
				});

			let evData = {origin: '*', data: '{"id":1,"taskId":2,"action":"execute","method":"' + _fn + '","isEncodedMethod":true}'};

			let result = wt.onMessage(evData);

			expect(GeneralUtils.isPromise).toHaveBeenCalledWith({
				then: jasmine.any(Function)
			});
			expect(window.postMessage).toHaveBeenCalledWith({
				id: 1,
				taskId: 2,
				action: 'execute',
				result: {then: jasmine.any(Function)},
				error: null
			}, '*');
		});
	});
});