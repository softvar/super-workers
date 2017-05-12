import WorkerStatusEnum from '../../src/enums/WorkerStatusEnum';

describe('WorkerStatusEnum', () => {
  it('should verify the key-value pair', () => {
    expect(WorkerStatusEnum.IDLE).toEqual('idle');
	expect(WorkerStatusEnum.ACTIVE).toEqual('active');
	expect(WorkerStatusEnum.TERMINATED).toEqual('terminated');
  });
});