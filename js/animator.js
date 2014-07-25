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

function Animator(animations, firstslide, current_objs) {
    var animations = animations;
    var currentslide = undefined;
    var current_objs = current_objs;
    var event_index = 0;
    var events = undefined;
    var reversal_stack = [];
    var running_actions = [];
    var queuecounter = new QueueCounter();

    this.objectify_action = function(action, slide) {
	var obj_action = false;
	if (action['action'] == 'rotateZ') {
	    obj_action = new RotateZ(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'rotateY') {
	    obj_action = new RotateY(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'rotateX') {
	    obj_action = new RotateX(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'pause') {
	    obj_action = new Pause(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'playvideo') {
	    obj_action = new PlayVideo(slide, action);
	}
	if (action['action'] == 'pystep') {
	    var aux_obj = current_objs[action['id']];
	    obj_action = new PyTutor(slide, {'action': 'pystep', 'id': action['id'], 'visualizer': aux_obj});
	}
	if (action['action'] == 'scale') {
	    obj_action = new Scale(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'move') {
	    obj_action = new Move(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'sizew') {
	    obj_action = new SizeW(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'sizeh') {
	    obj_action = new SizeH(slide, action, queuecounter.new_queue());
	}
	if (action['action'] == 'fade') {
	    obj_action = new Fade(slide, action, queuecounter.new_queue());
	}
	return obj_action;
    }

    this.objectify_event = function(event, slide) {
	var obj_event = [];
	var animator = this;
	$.each(event, function(i, action) {
	    var obj_action = animator.objectify_action(action, slide);
	    if(obj_action) {
		obj_event.push(obj_action);
	    }
	});
	return obj_event;
    }

    this.objectify_events = function(events, slide) {
	var obj_events = [];
	var animator = this;
	$.each(events, function(i, event) {
	    obj_events.push(animator.objectify_event(event, slide));
	});
	return obj_events;
    }

    this.get_eventindex = function() {
	return event_index;
    }

    this.set_currentslide = function(slide) {
	console.log('Loading slide: ' + slide.attr('id'));
	currentslide = slide;
	event_index = 0;
	events = this.objectify_events(animations.getslide(slide.attr('id')), currentslide);
    }

    this.set_current_objs = function(objs) {
	current_objs = objs;
    }

    //Set first slide
    this.set_currentslide(firstslide);

    this.commitEvents = function() {
	animations.clearAllEvents(currentslide.attr('id'));
	$.each(events, function(i, event) {
	    console.log('Committing event no. ' + i);
	    animations.commitEvent(event, currentslide.attr('id'), i);
	});
    }

    this.getActionObjFromLast = function(id, actionname) {
	var lastactions = reversal_stack[reversal_stack.length-1];
	var actionobj = false;
	if(lastactions !== undefined) {
	    $.each(lastactions, function(i, elt) {
		console.log('Dammit! Id: ' + elt.id() + ', action: ' + elt.actionname());
		if ((elt.id() == id) && (elt.actionname() == actionname)) {
		    actionobj = elt;
		    return false;
		}
	    });
	}
	return actionobj;
    }

    this.getActionObjsFromLast = function() {
	return reversal_stack[reversal_stack.length-1];
    }

    this.numEvents = function() {
	return events.length;
    }

    this.insertActionObjToLast = function(action_obj) {
	var lastactions = reversal_stack[reversal_stack.length-1];
	lastactions.push(action_obj);
    }

    this.more_events = function() {
	return (event_index < events.length);
    }

    this.first_event = function() {
	return (event_index == 1);
    }

    this.addEvent = function(index) {
	console.log('Add event at index: ' + index);
	events.splice(index, 0, []);
    }

    this.finish_last_event = function() {
	$.each(running_actions, function(i, action) {
	    console.log('Finishing animations on obj ' + action);
	    action.finish();
	});
	running_actions = [];
    }

    this.run_current_event = function() {
	animator = this;
	var event = events[event_index];
	console.log('Running event from list: ' + events);
	var action_reversal_stack = event;
	$.each(event, function(i, action) {
	    action.run();
	    //console.log('Running action: ' + action + '!');
	});
	event_index += 1;
	reversal_stack.push(action_reversal_stack);
	running_actions = action_reversal_stack;
    }

    this.jump_current_event = function() {
	this.run_current_event();
	this.finish_last_event();
    }

    this.reverse_last_event = function() {
	var event = reversal_stack.pop();
	$.each(event, function(i, action) {
	    action.reverse();
	});
	event_index -= 1;
    }

    this.isRemovable = function(action) {
	var nonremovable = {'pystep': 1, 'pause': 1}
	if (nonremovable[action.actionname()])
	    return false
	else
	    return true
    }

    this.moveEventDown = function() {
	var done = false;
	if (event_index < events.length) {
	    this.reverse_last_event();
	    var mevent = events.splice(event_index, 1)[0];
	    events.splice(event_index+1, 0, mevent);
	    done = true;
	    this.jump_current_event();
	    this.jump_current_event();
	}
	return done;
    }

    this.moveEventUp = function() {
	var done = false;
	if (event_index > 1) {
	    this.reverse_last_event();
	    this.reverse_last_event();
	    var mevent = events.splice(event_index+1, 1)[0];
	    events.splice(event_index, 0, mevent);
	    done = true;
	    this.jump_current_event();
	}
	return done;
    }

    this.clearLastEvent = function() {
	//var lastevent = reversal_stack[reversal_stack.length-1];
	var lastevent = reversal_stack.pop();
	console.log('Removing last event of size: ' + lastevent.length);

	// Reverse last event
	$.each(lastevent, function(i, action) {
	    action.reverse();
	});
	// Rewind counter and pop for consistency
	event_index -= 1;

	// Remove all removable actions from last event
	for (var i = (lastevent.length-1); i >= 0; i -= 1) {
	    var action = lastevent[i];
	    console.log('Should we remove action: ' + action.actionname() + '?');
	    if(this.isRemovable(action)) {
		console.log('Removing action: ' + action.actionname());
		lastevent.splice(i, 1);
	    }
	}

	var deleted = false;
	var jumped = false;
	// If all actions were removed, and it's not the initial event,
	// remove event.
	if((event_index > 0) && (lastevent.length == 0)) {
	    events.splice(event_index, 1);
	    deleted = true;
	}
	// If not on last event, replay the possibly new, last event
	if (event_index < events.length) {
	    this.jump_current_event();
	    jumped = true;
	}

	return [deleted, jumped];
    }
}