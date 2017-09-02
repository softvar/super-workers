import TaskStatusEnum from '../../src/enums/TaskStatusEnum';

describe('TaskStatusEnum', () => {
  it('should verify the key-value pair', () => {
    expect(TaskStatusEnum.PENDING).toEqual('pending');
    expect(TaskStatusEnum.QUEUED).toEqual('queued');
	expect(TaskStatusEnum.ACTIVE).toEqual('active');
	expect(TaskStatusEnum.FAILED).toEqual('failed');
	expect(TaskStatusEnum.COMPLETED).toEqual('completed');
  });
});