importScripts('../dist/super-workers.js');

var child = new SuperWorkers.WorkerThread();

child.exposeMethods({
	add: function (a, b) {
		return a + b;
	}
});
