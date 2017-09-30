/**
 * Enum for showing various warnings to suser when things done wrong
 * @type {Object}
 */
const WarningTextEnum = {
	INVALID_JSON: 'Invalid JSON Object!',
	PARSE_JSON: 'Can not parse stringifed data',
	NO_ID_PROVIDED: 'Valid worker id should be provided',
	INVALID_DATA: 'Some wrong message is being sent by Parent.',
	WORKER_ALREADY_TERMINATED: 'Web Worker has already been terminated.',
	CONFIG_REQUIRED: 'Configuration options required. Please read docs.',
	WORKER_NOT_SUPPORTED: 'Web Worker not supported on this browser version',
	URL_REQUIRED: 'Url is needed for creating and opening a new window/tab. Please read docs.'
};

export default WarningTextEnum;
