var watchedBitfield = require('../')
var tape = require('tape')

tape('construct from array, serialize/deserialize', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var wb = watchedBitfield.constructFromArray(bitArray, ids)
	
	t.deepEquals(wb.videoIds, ids, 'videoIds equal')
	t.deepEquals(range(0, bitArray.length).map(idx => wb.bitfield.get(idx) ? 1 : 0), bitArray, 'bitfield is equal')

	var serialized = wb.serialize()

	var wb2 = watchedBitfield.constructAndResize(serialized, ids)

	t.equal(wb.bitfield.length, wb2.bitfield.length, 'deserialized - bitfield length is ok')
	t.deepEquals(wb.bitfield.values, wb2.bitfield.values, 'deserialized - bitfield values are ok')
	t.deepEquals(wb.videoIds, wb2.videoIds, 'deserialized - videoIds are ok')

	t.end()
})

tape('construct from array respects videoIds length', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var wb = watchedBitfield.constructFromArray(bitArray, ids)
	
	t.equals(wb.bitfield.length, ids.length)
	t.deepEquals(wb.videoIds, ids, 'videoIds equal')
	t.deepEquals(range(0, bitArray.length).map(idx => wb.bitfield.get(idx) ? 1 : 0), bitArray, 'bitfield is consistent')

	t.end()
})


tape('keeps big arrays small in serialized size', function(t) {
	var bitArray = new Array(500)

	for (var i=0; i!=500; i++) bitArray[i] = 0

	// user watched first 40 and then some other 3, then another 4
	for (var i=0; i!=40; i++) bitArray[i] = 1
	for (var i=50; i!=53; i++) bitArray[i] = 1
	for (var i=400; i!=404; i++) bitArray[i] = 1

	var ids = bitArray.map(function(x, i) { return 'vid'+i })
	var wb = watchedBitfield.constructFromArray(bitArray, ids)

	var serialized = wb.serialize()

	t.ok(serialized.length < 50, 'under 50 characters')

	var wb2 = watchedBitfield.constructAndResize(serialized, ids)

	t.equal(wb.bitfield.length, wb2.bitfield.length, 'deserialized - bitfield length is ok')
	t.deepEquals(wb.bitfield.values, wb2.bitfield.values, 'deserialized - bitfield values are ok')
	t.deepEquals(wb.videoIds, wb2.videoIds, 'deserialized - videoIds are ok')

	t.end()
})

tape('construct and resize: appended objects', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var idsWithAppended = ids.concat([     'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'])
	var bitArrayExpected = bitArray.concat([0,   0,   0,   0,   0,   0,   0,   0,   0])

	testIsAsExpected(t, bitArray, ids, idsWithAppended, bitArrayExpected)

	t.end()
})

tape('construct and resize: append at the end, remove from the beginning', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var idsChanged = ids.slice(2).concat([     'd', 'e', 'f', 'g'])
	var bitArrayExpected = bitArray.slice(2).concat([0,   0,   0,   0])

	testIsAsExpected(t, bitArray, ids, idsChanged, bitArrayExpected)

	t.end()
})

tape('construct and resize: remove from the end, append to the beginning', function(t) {
	// the last ID that won't be popped ('a') needs to be the last watched, so we can use it as an anchor
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 0 , 0  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var idsChanged =       ['d', 'e'].concat(ids).slice(0, ids.length)
	var bitArrayExpected = [ 0,   0 ].concat(bitArray).slice(0, bitArray.length)

	testIsAsExpected(t, bitArray, ids, idsChanged, bitArrayExpected)

	t.end()
})

tape('construct and resize: append to the beginning', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 0 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var idsChanged =       ['d', 'e'].concat(ids)
	var bitArrayExpected = [ 0,   0 ].concat(bitArray)

	testIsAsExpected(t, bitArray, ids, idsChanged, bitArrayExpected)

	t.end()
})

tape('construct and resize: totally different set of IDs', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var idsWithAppended = ['d', 'e', 'f', 'g', 'h', 'n', 'm', 'l']
	var bitArrayExpected = [0,   0,   0,   0,   0,   0,   0,   0]

	testIsAsExpected(t, bitArray, ids, idsWithAppended, bitArrayExpected)

	t.end()
})

tape('deserialize, set a few fields, serialize again', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var serialized = watchedBitfield.constructFromArray(bitArray, ids).serialize()

	var wb1 = watchedBitfield.constructAndResize(serialized, ids)
	
	wb1.setVideo('3', true)
	bitArray[2] = 1

	wb1.setVideo('b', false);
	bitArray[10] = 0

	var wb2 = watchedBitfield.constructAndResize(wb1.serialize(), ids)

	t.equals(wb2.bitfield.length, bitArray.length, 'length is correct')
	t.deepEquals(bfToArr(wb2.bitfield), bitArray, 'bitArray is correct')

	t.equals(wb2.getVideo('3'), true, 'getVideo correct')
	t.equals(wb2.getVideo('b'), false, 'getVideo is correct')

	t.end()
})


// helpers lol
function testIsAsExpected(t, bitArray, ids, idsChanged, arrExpected) {
	var serialized = watchedBitfield.constructFromArray(bitArray, ids).serialize()

	var wb = watchedBitfield.constructAndResize(serialized, idsChanged)

	t.equal(Math.ceil(arrExpected.length / 8), wb.bitfield.values.length, 'bitfield length is as expected')
	t.equal(wb.bitfield.length, arrExpected.length)
	t.deepEquals(bfToArr(wb.bitfield), arrExpected, 'bit array is as expected')

	var lastWatchedIdx = Math.max(0, wb.bitfield.lastIndexOf(true))
	t.ok(wb.serialize().startsWith(idsChanged[lastWatchedIdx]))
}

function bfToArr(bf) {
	return range(0, bf.length)
	.map(function(x, i) {
		return bf.get(i) ? 1 : 0
	})
}

function range(a, b) {
	var ar = []
	for (var i=a; i!=b; i++) ar.push(i)
	return ar
}
