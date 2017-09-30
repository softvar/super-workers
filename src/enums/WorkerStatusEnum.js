/**
 * Enum for Worker status(still active / idle) used for client-worker-communication
 * @type {Object}
 */
const WorkerStatusEnum = {
	IDLE: 'idle',
	ACTIVE: 'active',
	TERMINATED: 'terminated'
};

export default WorkerStatusEnum;
