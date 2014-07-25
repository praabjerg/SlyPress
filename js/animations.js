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

function Animations(idmanager, slidexml, htmlslides) {
    var htmlslides = htmlslides;
    var slidexml = slidexml;
    var animdata = {};
    var idmanager = idmanager;
    var lastpauseindex = false;
    var currentpause = 0;
    this.animgc = function() {
	slideelements = $(slidexml).find('slide');
	var auxanims = {};
	slideelements.each(function() {
	    var slideid = $(this).attr('id');
	    if (!(slideid === undefined)) {
		//console.log('Slide ID for anim is: ' + slideid);
		if (animdata[slideid])
		    auxanims[slideid] = animdata[slideid];
		else
		    auxanims[slideid] = [[]];
	    }
	});
	$.each(auxanims, function(i, slideanims) {
	    console.log('Animdata ' + i + ' is: ' + slideanims);
	});
	animdata = auxanims;
    }

    this.newanims = function(slideid) {
	animdata[slideid] = [[]];
    }

    this.loadanims = function() {
	var loadsuccess = true;
	animdata = loadfile('working.json', 'json');
	if(!animdata) {
	    animdata = {};
	    console.log('Creating new animations dict');
	}
	//console.log('Loaded anim: ' + animdata['d0']);
    }

    this.saveanims = function() {
	var animjson = JSON.stringify(animdata);
	jQuery.post('outanims', {animdata: animjson}, function(msg) {
	    console.log("Anims saved: " + msg);
	}, 'text');
    }

    this.clearAllEvents = function(slideid) {
	animdata[slideid] = [];
    }

    this.commitEvent = function(event, slideid, index) {
	var commitlist = [];
	$.each(event, function(i, eventobj) {
	    commitlist.push(eventobj.toData());
	});
	animdata[slideid][index] = commitlist;
    }

    this.getslide = function(id) {
	return animdata[id];
    }

    this.eventHasStepAction = function(actionname, event, id) {
	var result = false;
	$.each(event, function(action_index, action) {
	    if (action['action'] == actionname) {
		if (action['id'] == id) {
		    result = action_index;
		    //Returning false ends the loop
		    return false;
		}
	    }
	});
	return result;
    }

    this.stepActionsIndexes = function(actionname, slideid, id) {
	var events = animdata[slideid];
	var result = [];
	anim_obj = this;
	$.each(events, function(event_index, event) {
	    var action_index = anim_obj.eventHasStepAction(actionname, event, id);
	    if (!(action_index === false))
		result.push([event_index, action_index]);
	});
	return result;
    }

    this.numEvents = function(slideid) {
	return animdata[slideid].length;
    }

    //Ooh. Bug? Using event_index on animdata here... Yeah. Should be fixed.
    //But is used only in special cases for PyTutor currently.
    //Fixed, I hope.
    this.removeActions = function(slideid, actionindexes) {
	$.each(actionindexes, function(i, ind) {
	    var event_index = ind[0];
	    var action_index = ind[1];
	    animdata[slideid][event_index].splice(action_index, 1);
	    if (animdata[slideid][event_index].length == 0)
		animdata[slideid].splice(event_index, 1);
	});
    }

    this.addStepEvents = function(slideid, num, event, at) {
	var event_index = at;
	for (var i = event_index; i < (event_index + num); i++) {
	    this.insert_event(slideid, event, i+1);
	}
    }

    this.event_haspause = function(event, pid) {
	var result = false;
	$.each(event, function(j, action) {
	    if (action['action'] == 'pause') {
		if (action['pid'] == pid) {
		    result = j;
		    //Returning false ends the loop
		    return false;
		}
	    }
	});
	return result;
    }

    this.events_haspause = function(slideid, pid) {
	var events = animdata[slideid];
	var result = false;
	anim_obj = this;
	$.each(events, function(i, event) {
	    j = anim_obj.event_haspause(event, pid);
	    if (!(j === false)) {
		result = [i, j];
		//Returning false ends the loop
		return false;
	    }
	});
	return result;
    }

    this.insert_event = function(slideid, new_event, before) {
	animdata[slideid].splice(before,0,new_event);
    }

    this.treat_pause = function(xml_elt, slide_id) {
	currentpause++;
	var pid = idmanager.apply_pause_id(xml_elt);
	actionindex = this.events_haspause(slide_id, pid);
	if (actionindex) {
	    // Return the index of the event
	    lastpauseindex = actionindex[0];
	}
	else {
	    var new_event = {'action': 'pause',
			     'pid': pid};
	    if(lastpauseindex === false) {
		this.insert_event(slide_id, [new_event], 1);
		lastpauseindex = 1;
	    }
	    else {
		this.insert_event(slide_id, [new_event], lastpauseindex+1);
		lastpauseindex += 1;
	    }
	}
    }

    this.setpauses_rec = function(elt, slide, html_slide) {
	var pauseseen = false;
	var pid = false;
	anim_obj = this;
	console.log('Setting pauses recursively!');
	elt.children().each(function() {
	    if ($(this).is('pause')) {
		console.log('Setting pauseseen!');
		pauseseen = true;
		anim_obj.treat_pause($(this), slide.attr('id'));
		pid = $(this).attr('pid');
	    }
	    else {
		if (pauseseen) {
		    console.log('Pause seen! PID: ' + pid);
		    htmlelt = $('#' + $(this).attr('id'));
		    htmlelt.css('opacity', 0);
		    if (pid) {
			console.log('Applying PID to HTML element');
			htmlelt.attr('pid', pid);
		    }
		}
		var subeltpausepid = anim_obj.setpauses_rec($(this), slide, html_slide);
		if(subeltpausepid[0] == true) {
		    pauseseen = true;
		    pid = subeltpausepid[1];
		}
	    }
	});
	return [pauseseen, pid];
    }

    this.set_pauses = function(slideid) {
	var xml_slide = $(slidexml).find('#' + slideid);
	var html_slide = htmlslides.find('#' + slideid);
	lastpauseindex = false;
	this.setpauses_rec(xml_slide, xml_slide, html_slide);
    }

    this.loadanims();
}
