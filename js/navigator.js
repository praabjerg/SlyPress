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

/* Class used for implementing navigation in presentation mode.
 */
function Navigator(animations, allslides, slideparser, controller, browser, xml, document) {
    "use strict";
    var mode = 'presentation';

    var numslides = allslides.length;

    //Load first two slides
    var currents = slideparser.parse_slidenum(0, 1);
    var currentslide = currents.slide;
    var nexts = slideparser.parse_slidenum(1, 0, false);
    var nextslide = nexts.slide;
    var next_objs = nexts.aux_objs;
    var animator = new Animator(animations, currentslide, currents.aux_objs);
    var slideswitcher = new SlideSwitcher(document, this);
    var eventeditor = new EventEditor(xml, document, numslides, allslides, slideparser, animations, animator, this);

    var slideindex = 0;

    var advancing = false;

    //Initiate slide counter
    controller.setslidenum(slideindex, numslides);
    //Set first title
    controller.settitle(currentslide, true);
    //Run (and finish instantly) first event to set properties
    animator.run_current_event();
    animator.finish_last_event();

    /* Set controls for presentation mode
     */
    this.setPresentNavigation = function() {
	var navigator = this;
	$(document).keydown(function(event) {
            if (KEYMAP.next.indexOf(event.keyCode) != -1) {
		navigator.advance();
	    }
            if (KEYMAP.prev.indexOf(event.keyCode) != -1) {
		navigator.previous();
	    }
            if (KEYMAP.singleshot.indexOf(event.keyCode) != -1) {
		browser.screenshot_slide('screenshots/imgslide', slideindex, animator.get_eventindex());
	    }
            if (KEYMAP.thumbshots.indexOf(event.keyCode) != -1) {
		browser.shoot_thumbnails(navigator);
	    }
            if (KEYMAP.resizethumbs.indexOf(event.keyCode) != -1) {
		browser.resize_thumbnails();
	    }
            if (KEYMAP.toggleswitcher.indexOf(event.keyCode) != -1) {
		event.preventDefault();
		slideswitcher.setSwitchToSlideNavigation(slideindex, numslides);
	    }
            if (KEYMAP.toggleedit.indexOf(event.keyCode) != -1) {
		event.preventDefault();
		event.stopPropagation();
		eventeditor.setEditNavigation(slideindex);
	    }
	});
    };

    //Set navigation to presentation mode on Navigator instantiation
    this.setPresentNavigation();

    /* As long as a slide transition is in progress, advancing is set to true.
     */
    this.is_advancing = function() {
	return advancing;
    };

    /* Get total number of slides
     */
    this.get_numslides = function() {
	return numslides;
    };

    /* Get HTML element for current slide
     */
    this.getCurrentSlide = function() {
	return currentslide;
    };

    /* Get ID of current slide
     */
    this.getCurrentID = function() {
	return currentslide.attr('id');
    };

    /* Get index of current slide
     */
    this.getSlideIndex = function() {
	return slideindex;
    };

    /* Run next event (or if last event, switch to next slide)
     */
    this.advance = function() {
	animator.finish_last_event();
	if (animator.more_events()) {
	    console.log('Event advance!');
	    this.event_advance();
	}
	else
	    this.slide_fade_advance();
    };

    /* Reverse to previous event (or if first event, switch to previous slide)
     */
    this.previous = function() {
	if (animator.first_event())
	    this.slide_previous();
	else {
	    console.log('Event go back!');
	    this.event_previous();
	}
    };

    /* Skip an event
     */
    this.event_skip = function() {
	animator.finish_last_event();
	if (animator.more_events()) {
	    animator.run_current_event();
	    animator.finish_last_event();
	}
    };

    /* Skip to last event
     */
    this.events_skip_to_end = function() {
	while (animator.more_events()) {
	    animator.run_current_event();
	    animator.finish_last_event();
	}
    };

    /* Animate to next event
     */
    this.event_advance = function() {
	animator.run_current_event();
    };

    /* Switch to previous event
     */
    this.event_previous = function() {
	animator.reverse_last_event();
    };

    /* Set visibility of header and footer according to XML attributes
     */
    this.setheadfoot = function(instant) {
	var xmlslide = $(allslides[slideindex]);
	if (xmlslide.attr('header') == 'no')
	    controller.hidetitle(instant);
	else
	    controller.showtitle(instant);

	if (xmlslide.attr('footer') == 'no')
	    controller.hidefooter(instant);
	else
	    controller.showfooter(instant);
    };

    /* Set instantly for first slide on Navigator initialisation
     */
    this.setheadfoot(true);

    /* Fade to next slide
     */
    this.slide_fade_advance = function() {
	//If last slide, ignore!
	if(slideindex < numslides-1) {
	    //If a slide is still fading in from previous change, finish.
	    nextslide.finish();

	    /* I'm not actually sure why I had this condition.
	     * Presumably, it was used as a safety measure, to make
	     * sure nothing happens out-of-order. A surprising number
	     * of things have to happen with each slide change, and
	     * they depend somewhat on the previous change being finished.
	     * But advancing is set only during the fading of a slide,
	     * and nextslide.finish(); is going to finish the previous
	     * change anyway, before anything else happens.
	     * I'll keep it as a comment for the time
	     * being, in case it turns out to have been important.
	     */
	    //if(!advancing) {
	    slideindex += 1;
	    advancing = true;
	    //Put the next slide on top (the slide class has opacity:0 as default in present.css)
	    nextslide.css('z-index', 2);
	    //Animate header and footer to their state on next slide.
	    this.setheadfoot(false);
	    //Set number and title for next slide
	    controller.setslidenum(slideindex, numslides);
	    controller.settitle(nextslide);
	    //Switch object list to objects for next slide
	    animator.set_current_objs(next_objs);
	    //Set next slide as current in animator
	    animator.set_currentslide(nextslide);
	    console.log('Going to skip event');
	    //Skip first event on next slide to set starting positions.
	    this.event_skip();
	    console.log('Skipped event');

	    nextslide.animate({'opacity': 1},
			      {'duration': 500,
			       'always': function() {
				   //When fading is finished, remove old currentslide from DOM
				   //and set next as currentslide instead.
				   currentslide.remove();
				   currentslide = nextslide;
				   //Index was 2 during fade. Move back one to accommodate next fade.
				   currentslide.css('z-index', 1);
				   console.log('Advance! Slideindex: ' + slideindex + ', Numslides: ' + numslides);
				   //If there is a slide after this one, parse it and set as nextslide.
				   if (numslides > slideindex+1) {
				       nexts = slideparser.parse_slidenum(slideindex+1, 0, false);
				       nextslide = nexts.slide;
				       next_objs = nexts.aux_objs;
				   }
				   advancing = false;
			       }});
	    //}
	}
    };

    /* Jump to arbitrary slide
     */
    this.slide_goto = function(new_slideindex, skip_to_end) {
	advancing = true;
	//Finish any slide fading
	nextslide.finish();
	//Change slideindex
	slideindex = new_slideindex;
	console.log('Goto slideindex!: ' + slideindex + ', Numslides: ' + numslides);
	//Temporarily store currentslide and nextslide for eventual removal.
	var oldslide = currentslide;
	var oldslide2 = nextslide;
	//Parse new currentslide
	currents = slideparser.parse_slidenum(slideindex, 2, false, true);
	currentslide = currents.slide;
	//Set objects
	animator.set_current_objs(currents.aux_objs);
	//Remove old currentslide and nextslide from the DOM
	oldslide.remove();
	oldslide2.remove();
	//Parse new nextslide
	nexts = slideparser.parse_slidenum(slideindex+1, 0, false);
	nextslide = nexts.slide;
	next_objs = nexts.aux_objs;
	//Set current slide in animator
	animator.set_currentslide(currentslide);
	//Skip first event on entered slide, or skip to end
	if (skip_to_end)
	    this.events_skip_to_end();
	else
	    this.event_skip();
	//Reveal new currentslide
	currentslide.css('opacity', 1);
	currentslide.css('z-index', 1);
	//Set new header and footer state instantly
	this.setheadfoot(true);
	//Set number and title of slide
	controller.setslidenum(slideindex, numslides);
	controller.settitle(currentslide, true);
	advancing = false;
    };

    /* Jump to previous slide
     */
    this.slide_previous = function() {
	if(slideindex > 0) {
	    this.slide_goto(slideindex-1, true);
	}
    };
}
