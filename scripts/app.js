// Check if browser is capable
if ((typeof webkitAudioContext === 'undefined') && (typeof AudioContext === 'undefined')) {
    document.querySelectorAll('.synth')[0].insertAdjacentHTML('afterbegin',
        '<h1>Sorry, your browser doesn\'t support the Web Audio API. ' +
        'Try <a href="http://google.com/chrome">Chrome</a> instead!</h1>');
}

var synth = new Synth({
        context: tsw.context(),
        speakersOn: true
    }),
    keyboard = new QwertyHancock({
        id: 'keyboard',
        width: 908,
        height: 150,
        startKey: 'A3',
        hoverColour: '#FFE976'
    });

var inputs = document.getElementsByTagName('input'),
    selects = document.getElementsByTagName('select');

// Turn NodeLists into Arrays
inputs = Array.prototype.slice.call(inputs);
selects = Array.prototype.slice.call(selects);

inputs = inputs.concat(selects);

var updateSettings = function () {
    var osc = this.getAttribute('data-oscillator'),
        param = this.getAttribute('data-param');

    switch (param) {
        case 'range':
            synth.oscillators[osc][param] = this.value;
            break;
        case 'waveform':
            synth.oscillators[osc][param] = this.value;
            break;
        case 'detune':
            synth.oscillators[osc][param] = this.value;
            synth.activeOscillators.forEach(function (oscillator) {
                oscillator.detune.value = synth.oscillators[osc][param];
            });
            break;
        case 'filter':
            switch (this.name) {
                case 'filter-attack':
                    synth.filterEnvelopeSettings.attack = parseInt(this.value, 10);
                    break;
                case 'filter-decay':
                    synth.filterEnvelopeSettings.decay = parseInt(this.value, 10);
                    break;
                case 'filter-sustain':
                    synth.filterEnvelopeSettings.sustain = parseInt(this.value, 10);
                    break;
                case 'filter-release':
                    synth.filterEnvelopeSettings.release = parseInt(this.value, 10);
                    break;
                case 'cutoffFrequency':
                    synth.filterEnvelopeSettings.startLevel = parseInt(this.value, 10);
                    break; 
                case 'emphasis':
                    synth.filterEnvelopeSettings.Q = parseInt(this.value, 10);
                    break;
                case 'contour':
                    //synth.filter.node.Q.value = parseInt(this.filter.emphasis, 10);
                    break;
                default:
                    break;
            };
            break;
        case 'volume-filter':
            synth.volumeEnvelopeSettings[this.name] = parseFloat(this.value, 10);
            break;
        case 'mixer':
            synth.mixer[osc].node.gain(this.value);
            break;
        case 'lfo':
            switch (this.name) {
                case 'lfo-waveType':
                    synth.lfoSettings.waveType = this.value;
                    break;
                case 'lfo-frequency':
                    synth.lfoSettings.frequency = this.value;
                    break;
                case 'lfo-depth':
                    synth.lfoSettings.node.depth = this.value;
                    break;
                default:
                    break;
            };
        case 'volume':
            synth.masterVolume.gain(this.value);
            break;
        case 'noise':
            synth.noiseLevel.gain(this.value);
            break;
        default:
            break;
    };
};

for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function () {
        updateSettings.call(this);
    });

    updateSettings.call(inputs[i]);
}

keyboard.keyDown = function (note, frequency) {
    synth.playNote(note);
};

keyboard.keyUp = function (note, frequency) {
    synth.stopNote(note);
};

var messageReceived = function (message) {

    var note = tsw.midiNote(message.data[1]),
        keys = document.querySelectorAll('#keyboard li');

    // Only accept note data.
    if (message.data[0] === 144) {
        if (message.data[2]) {

            // Change colour of key on keyboard.
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].attributes.title.value === note) {
                    keys[i].style.backgroundColor = '#FFE976';
                }
            }

            synth.playNote(note);
        } else {
            // Chance colour of key on keyboard.
            for (var i = 0; i < keys.length; i++) {
                    if (keys[i].attributes.title.value === note) {
                        if (keys[i].attributes.title.value.match('#')) {
                            keys[i].style.backgroundColor = 'black';
                        } else {
                            keys[i].style.backgroundColor = 'white';
                        }
                    }
            }
            synth.stopNote(tsw.midiNote(message.data[1]));
        }
    }
};

tsw.getUserMidi(function (midi) {
    window.midi = midi
    var inputs = midi.inputs();

    //document.querySelector('.config-bar').style.display = 'block';

    if (inputs.length) {
        var input = inputs[0];
        input.addEventListener('midimessage', messageReceived);
    }
}, function () {
    console.log('no midi support')
});