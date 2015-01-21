var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var notes = [
	"Ab",
	"A",
	"Bb",
	"B",
	"C",
	"Db",
	"D",
	"Eb",
	"E",
	"F",
	"Gb",
	"G",
];


var range = [-1,1];

function getData(data){
	return data.HandLeft.Item2;
}

function getNote(param,octave){
	octave = octave || 4;
  	var len = notes.length; // ex: 7
  	var rangeLength = range[1] - range[0]; // = 2
  	var index = Math.floor(((param - range[0]) / rangeLength) * notes.length);
  	if(index >= len) index = len - 1;
  	if(index < 0) index = 0;
  	var note = notes[index] + octave;
  	if(!notes[index]) console.log(param,octave,index,note); 
  	return note;
}

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('kinect',function(rawData){
  	
  	var data = JSON.parse(rawData); // [-1,1], ex: 0.45

  	var values = [getNote(data.HandLeft.Item2,'3'),getNote(data.HandRight.Item2,'5')];

  	socket.broadcast.emit('playnote',values);

  });
});



http.listen(8081, function(){
  console.log('listening on *:8081');
});