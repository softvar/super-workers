/**
 * Enum for Worker status(still active / idle) used for client-worker-communication
 * @type {Object}
 */
const TaskStatusEnum = {
  PENDING: 'pending',
  QUEUED: 'queued',
  ACTIVE: 'active',
  FAILED: 'failed',
  COMPLETED: 'completed'
};

export default TaskStatusEnum;
