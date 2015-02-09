// NPM imports
var _ = require('lodash');

// Project imports
var world = require('./world');


function onLoad() {
    var canvas = document.querySelector('#viewport');
    Physics(_.bind(world, this, canvas));
}

window.onload = onLoad;

