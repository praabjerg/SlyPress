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
    "use strict";
    var animdata = {};
    var lastpauseindex = false;
    var currentpause = 0;

    /* Garbage collection on the animations.
     * Runs through all the slides in the XML
     * definitions. Retain only animations that
     * refer to existing slide-ids.
     */
    this.animgc = function() {
        var slideelements = $(slidexml).find('slide');
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

    /* Initialize/reset a slide-slot in the animation data.
     */
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

    this.serialize = function() {
        return JSON.stringify(animdata);
    };


    /* Waait. This does almost exactly the same as newanims.
     * Am I actually using both of these?
     */
    this.clearAllEvents = function(slideid) {
	animdata[slideid] = [];
    }

    /* Commit modified event to animation data.
     */
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

    /* Step actions: Special actions generated automatically by
     * plugins.
     * They should not be deleteable, but it should be possible
     * to clear events for all other actions than step actions.
     *
     * Returns false if the event does not have an action of the given name.
     * If event has a step action of that name, returns the index of the action in the list.
     */
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

    /* Return a list of pairs identifying all actions of a given name.
     * Each pair is on the form [event_index, action_index].
     */
    this.stepActionsIndexes = function(actionname, slideid, id) {
	var events = animdata[slideid];
	var result = [];
	var anim_obj = this;
	$.each(events, function(event_index, event) {
	    var action_index = anim_obj.eventHasStepAction(actionname, event, id);
	    if (!(action_index === false))
		result.push([event_index, action_index]);
	});
	return result;
    }

    /* Get number of events in a slide.
     */
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

    /* Add multiple events at once. Useful for adding
     * step events.
     */
    this.addStepEvents = function(slideid, num, event, at) {
	var event_index = at;
	for (var i = event_index; i < (event_index + num); i++) {
	    this.insert_event(slideid, event, i+1);
	}
    }

    /* Check if event has a pause action
     */
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

    /* Check if list of events has pause pid already.
     * If they do, return position with [event_index, action_index].
     */
    this.events_haspause = function(slideid, pid) {
	var events = animdata[slideid];
	var result = false;
	var anim_obj = this;
	$.each(events, function(i, event) {
	    var j = anim_obj.event_haspause(event, pid);
	    if (!(j === false)) {
		result = [i, j];
		//Returning false ends the loop
		return false;
	    }
	});
	return result;
    }

    /* Insert single event into slide.
     */
    this.insert_event = function(slideid, new_event, before) {
	animdata[slideid].splice(before,0,new_event);
    }

    /* Called from setpauses_rec.
     * xml_elt is a pause tag from the XML
     */
    this.treat_pause = function(xml_elt, slide_id) {
	currentpause++;
        //Applies a pid to xml_elt if a pid does not exist.
	var pid = idmanager.apply_pause_id(xml_elt);
	var actionindex = this.events_haspause(slide_id, pid);
        /* If pause pid exists in the events already
	 * Set index of latest pause, and do nothing else.
         */
	if (actionindex) {
	    lastpauseindex = actionindex[0];
	}
        /* If pause pid does not exist yet, insert it in the
         * events after the latest registered pause index. */
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

    /* Recursively set pause pids and opacity appropriately
     * for step-by-step reveal of the slide.
     */
    this.setpauses_rec = function(elt, slide, html_slide) {
	var pauseseen = false;
	var pid = false;
	var anim_obj = this;
	console.log('Setting pauses recursively!');
        //Run through all child elements in the XML element elt
	elt.children().each(function() {
            /* If the element is a pause, we set pauseseen,
             * call treat_pause and set the resulting pid.
             */
	    if ($(this).is('pause')) {
		console.log('Setting pauseseen!');
		pauseseen = true;
		anim_obj.treat_pause($(this), slide.attr('id'));
		pid = $(this).attr('pid');
	    }
	    else {
                /* If it's not a pause, but we have seen a pause
                 * within the parent element, we set the opacity
                 * to 0 and apply the pid to the HTML element.
                 */
		if (pauseseen) {
		    console.log('Pause seen! PID: ' + pid);
		    var htmlelt = $('#' + $(this).attr('id'));
		    htmlelt.css('opacity', 0);
		    if (pid) {
			console.log('Applying PID to HTML element');
			htmlelt.attr('pid', pid);
		    }
		}
                /* Recursive call for the sub-elements of $(this).
                 * subeltpausepid is a pair [pauseseen, pid].
                 * If there was a pause in $(this), we set pauseseen
                 * and update the latest pid.
                 */
		var subeltpausepid = anim_obj.setpauses_rec($(this), slide, html_slide);
		if(subeltpausepid[0] == true) {
		    pauseseen = true;
		    pid = subeltpausepid[1];
		}
	    }
	});
        /* pauseseen should be true if we found a pause in elt
         * or any of its sub-elements.
         * pid should contain the latest seen pid.
         */
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
