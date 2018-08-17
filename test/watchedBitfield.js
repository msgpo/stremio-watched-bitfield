var watchedBitfield = require('../')
var tape = require('tape')

tape('construct from array, serialize/deserialize', function(t) {
	var bitArray = [  0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 1 , 1 , 1  ]
	var ids =      [ '1','2','3','4','5','6','7','8','9','a','b','c' ]

	var wb = watchedBitfield.constructFromArray(bitArray, ids)
	
	t.deepEquals(wb.videoIds, ids, 'videoIds equal')
	t.deepEquals(range(0, bitArray.length).map(idx => wb.bitfield.get(idx) ? 1 : 0), bitArray, 'bitfield is equal')

	var serialized = wb.serialize()

	console.log(serialized)

	//console.log(watchedBitfield.constructAndResize(serialized, ids))

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

	console.log(serialized)

	t.ok(serialized.length < 50, 'under 50 characters')

	// @TODO: can recover it

	t.end()
})

tape('construct and resize: appended objects', function(t) {
	t.end()
})

tape('construct and resize: append at the end, remove from the beginning', function(t) {
	t.end()
})

// helpers lol
function range(a, b) { var ar = []; for (var i=a; i!=b; i++) ar.push(i); return ar }

// if (Array.isArray(state.watchedEpisodes) && meta.videos.length === state.watchedEpisodes.length) {
// 	watchedBitfield.constructFromArray(state.watchedEpisodes, meta.videos.map(function(v) { return v._id }))
// }