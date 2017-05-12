import WorkerActionEnum from '../../src/enums/WorkerActionEnum';

describe('WorkerActionEnum', () => {
  it('should verify the key-value pair', () => {
    expect(WorkerActionEnum.READY).toEqual('ready');
	expect(WorkerActionEnum.EXEC).toEqual('execute');
  });
});