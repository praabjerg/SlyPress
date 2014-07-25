/*    SlyPres is a slide presentation framework.
 *    Copyright (C) 2014  Palle Raabjerg
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function QueueCounter() {
    var queue = 0;

    this.new_queue = function() {
	var queuename = 'q' + queue;
	queue += 1;
	return queuename;
    }
}

/*function Action() {
    this.continuations = [];
}
Action.prototype.addContinuation = function(contobj) {
    this.continuations.push(contobj);
}
Action.prototype.numContinuations = function() {
    return this.continuations.length;
}
Action.prototype.continuationData = function() {
    var contdata = [];
    $.each(this.continuations, function() {
	contdata.push($(this).toData());
    });
    return contdata;
}
Action.prototype.runContinuations = function() {
}

Pause.prototype = new Action();
Pause.prototype.constructor = Pause;*/

function RotateZ(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.deg = data['deg'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldrot = elt.css('rotate');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	console.log('Running rotation, deg: ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'rotate': this.deg
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	this.finish();
	console.log('Moving from finishing: ' + this.deg + ', to old rotation: ' + this.oldrot);
	elt.animate({'rotate': this.oldrot}, 0);
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'rotateZ', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'deg': this.deg};
    }
}

function RotateY(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.deg = data['deg'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldrot = elt.css('rotateY');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	console.log('Running rotation, deg: ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'rotateY': this.deg
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	this.finish();
	elt.animate({'rotateY': this.oldrot}, 0);
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'rotateY', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'deg': this.deg};
    }
}

function RotateX(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.deg = data['deg'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldrot = elt.css('rotateX');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	console.log('Running rotation, deg: ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'rotateX': this.deg
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	this.finish();
	elt.animate({'rotateX': this.oldrot}, 0);
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'rotateX', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'deg': this.deg};
    }
}

function Move(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.left = data['left'];
    this.top = data['top'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldleft = elt.css('left');
	this.oldtop = elt.css('top');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'left': this.left,
	    'top': this.top
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	this.finish();
	elt.css({'left': this.oldleft,
		 'top': this.oldtop});
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'move', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'left': this.left, 'top': this.top};
    }
}

function Scale(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.scaleX = data['scaleX'];
    this.scaleY = data['scaleY'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldscaleX = elt.css('scaleX');
	this.oldscaleY = elt.css('scaleY');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'scaleX': this.scaleX,
	    'scaleY': this.scaleY
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	this.finish();
	elt.css({'scaleX': this.oldscaleX,
		 'scaleY': this.oldscaleY});
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'scale', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'scaleX': this.scaleX, 'scaleY': this.scaleY};
    }
}

function SizeW(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.width = data['width'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldwidth = elt.css('width');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'width': this.width
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	this.finish();
	elt.css({'width': this.oldwidth});
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'sizew', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'width': this.width};
    }
}

function SizeH(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.height = data['height'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldheight = elt.css('height');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'height': this.height
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	this.finish();
	elt.css({'height': this.oldheight});
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'sizeh', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'height': this.height};
    }
}

function Fade(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elt = slide.find('#' + data['id']);
    this.duration = data['duration'];
    this.delay = data['delay'];
    this.opacity = data['opacity'];

    this.id = function() {
	return data['id'];
    }

    this.setold = function() {
	this.oldfade = elt.css('opacity');
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	this.setold();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
	if (this.delay != 0)
	    elt.delay(this.delay, queuename);
	elt.animate({
	    'opacity': this.opacity
	}, {duration: this.duration,
	    queue: queuename});
	elt.dequeue(queuename);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	this.finish();
	elt.css({'opacity': this.oldfade});
    }

    this.finish = function() {
	elt.finish(queuename);
    }

    this.toData = function() {
	return {'action': 'fade', 'id': data['id'],
		'duration': this.duration, 'delay': this.delay, 'opacity': this.opacity};
    }
}

function PlayVideo(slide, data) {
    var data = data;
    var elt = slide.find('#' + data['id']);

    this.id = function() {
	return data['id'];
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	console.log('Running video with src ' + elt.attr('src'));
	elt.get(0).play();
	//console.log('Running move, : ' + this.deg + ', duration: ' + this.duration);
    }

    this.reverse = function() {
	//console.log('Reversing move!, from (' + );
	elt.get(0).pause();
	elt.get(0).load();
    }

    this.finish = function() {
    }

    this.toData = function() {
	return {'action': 'playvideo', 'id': data['id']};
    }
}

function Pause(slide, data, queuename) {
    var data = data;
    var queuename = queuename;
    var elts = slide.find('*[pid=' + data['pid'] + ']');
    console.log('Pause object. Num actions: ' + elts.length);

    this.id = function() {
	return data['pid'];
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	console.log('Go?');
	elts.animate({
	    opacity: 1
	}, {duration: 500,
	    queue: queuename});
	elts.dequeue(queuename);
    }

    this.reverse = function() {
	this.finish();
	elts.css('opacity', 0);
    }

    this.finish = function() {
	console.log('Finishing off animations: ' + elts);
	elts.finish(queuename);
	/*elts.animate({
	    opacity: 1
	}, {duration: 0,
	    queue: false});*/
    }

    this.toData = function() {
	return {'action': 'pause', 'pid': data['pid']};
    }
}

/*PyTutor.prototype = new Action();
PyTutor.prototype.constructor = PyTutor;*/

function PyTutor(slide, data) {
    var data = data;
    var visualizer = data['visualizer'];

    this.id = function() {
	return data['id'];
    }

    this.actionname = function() {
	return data['action'];
    }

    this.run = function() {
	console.log('Visualizer advance!');
	visualizer.stepForward();
    }

    this.reverse = function() {
	console.log('Visualizer step back!');
	visualizer.stepBack();
    }

    this.finish = function() {
    }

    this.toData = function() {
	return {'action': 'pystep', 'id': data['id']};
    }
}
