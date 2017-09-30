let ArrayUtils = {};

/**
 * Different type of data needed after searching an item(Object) within data(Array of Objects).
 * 1. `INDEX` returns just the index at which the item was present
 * 2. `OBJECT` returns the matched object
 * 3. `BOTH` returns an object { obj: matched_object, index: index_found }
 */
let returnPreferenceEnum = {
	INDEX: 'index',
	OBJECT: 'object',
	BOTH: 'both'
};

/**
 * Search for an item(Object) within a data-set(Array Of Objects)
 * @param  {Array of Objects} data
 * @param  {String} key - Unique key to search on the basis of
 * @param  {String} value - The matching criteria
 * @param  {String} returnPreference - what kind of output is needed
 * @return {Object}
 */
ArrayUtils.searchByKeyName = (data, key, value, returnPreference) => {
	if (!data || !key) { return false; }

	returnPreference = returnPreference || returnPreferenceEnum[1]; // default to Object
	let i;
	let obj;
	let returnData;
	let index = -1;

	for (i = 0; i < data.length; i++) {
		obj = data[i];
		// Number matching support
		if (!isNaN(value) && obj && parseInt(obj[key], 10) === parseInt(value, 10)) {
			index = i;
			break;
		} else if (isNaN(value) && obj && obj[key] === value) { // String exact matching support
			index = i;
			break;
		}
	}

	if (index === -1) { // item not found
		data[index] = {}; // for consistency
	}

	switch (returnPreference) {
		case returnPreferenceEnum.INDEX:
			returnData = index;
			break;
		case returnPreferenceEnum.BOTH:
			returnData = {
				obj: data[index],
				index: index
			};
			break;
		case returnPreferenceEnum.OBJECT:
		default:
			returnData = data[index];
			break;
	}

	return returnData;
};

/**
 * Sort array based on key defined.
 * @param {Array} arr - Array to be sorted
 * @param {String} key - key on which sort is required
 * @param {Boolean} orederBy - Sort in asc/desc order. If nothing is specified, it's ascending order.
 */
ArrayUtils.sortOn = (arr, key, orderBy) => {
	arr.sort(function (a, b) {
		return orderBy ? b[key] - a[key] : a[key] - b[key];
	});
};

/**
 * Sort array based on key:String defined.
 * @param {Array} arr - Array to be sorted
 * @param {String} key - key on which sort is required
 * @param {Boolean} orederBy - Sort in asc/desc order. If nothing is specified, it's ascending order.
 */
ArrayUtils.sortOnStringType = (arr, key) => {
	arr.sort(function (a, b) {
		if (a[key] < b[key]) {
			return -1;
		} else if (a[key] > b[key]) {
			return 1;
		}
		return 0;
	});
};

export default ArrayUtils;
