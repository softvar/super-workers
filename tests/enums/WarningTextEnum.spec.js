import WarningTextEnum from '../../src/enums/WarningTextEnum';

describe('WarningTextEnum', () => {
  it('should verify the key-value pair', () => {
    expect(WarningTextEnum.INVALID_JSON).toEqual('Invalid JSON Object!');
	expect(WarningTextEnum.PARSE_JSON).toEqual('Can not parse stringifed data');
	expect(WarningTextEnum.NO_ID_PROVIDED).toEqual('Valid worker id should be provided');
	expect(WarningTextEnum.INVALID_DATA).toEqual('Some wrong message is being sent by Parent.');
	expect(WarningTextEnum.WORKER_ALREADY_TERMINATED).toEqual('Web Worker has already been terminated.');
	expect(WarningTextEnum.CONFIG_REQUIRED).toEqual('Configuration options required. Please read docs.');
	expect(WarningTextEnum.WORKER_NOT_SUPPORTED).toEqual('Web Worker not supported on this browser version');
	expect(WarningTextEnum.URL_REQUIRED).toEqual('Url is needed for creating and opening a new window/tab. Please read docs.');
  });
});