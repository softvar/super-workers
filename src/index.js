import Promise from './Promise';

import MainThread from './MainThread';
import WorkerThread from './WorkerThread';
/**
 * Expose Parent and Child modules on SuperWorkers Object
 * @type {Object}
 */
const SuperWorkers = {
  MainThread: MainThread,
  WorkerThread: WorkerThread,
  Promise: Promise
};

export default SuperWorkers;
