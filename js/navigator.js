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

function Navigator(animations, allslides, slideparser, controller, browser, xml, document) {
    var browser = browser;
    var animations = animations;
    var slideparser = slideparser;
    var mode = 'presentation';
    var allslides = allslides;
    var controller = controller;
    var document = document;

    var numslides = allslides.length;
    //Load first two slides
    var currents = slideparser.parse_slidenum(0, 1);
    var currentslide = currents['slide'];
    var nexts = slideparser.parse_slidenum(1, 0, false);
    var nextslide = nexts['slide'];
    var next_objs = nexts['aux_objs'];
    var animator = new Animator(animations, currentslide, currents['aux_objs']);
    var slideswitcher = new SlideSwitcher(document, this);
    var eventeditor = new EventEditor(xml, document, numslides, allslides, slideparser, animations, animator, this);

    var slideindex = 0;

    var advancing = false;

    //Initiate slide counter
    controller.setslidenum(slideindex, numslides);
    //Set first title
    controller.settitle(currentslide, true);
    //Run first event to set properties
    animator.run_current_event();
    animator.finish_last_event();

    this.setPresentNavigation = function() {
	var navigator = this;
	$(document).keydown(function(event) {
	    if (/*event.keyCode == '32' || */event.keyCode == '39' || event.keyCode == '34') {
		navigator.advance();
	    }
	    if (/*event.keyCode == '8' || */event.keyCode == '37' || event.keyCode == '33') {
		navigator.previous();
	    }
	    if (event.keyCode == '113') {
		browser.screenshot_slide('imgversion/imgslide', slideindex, animator.get_eventindex());
	    }
	    if (event.keyCode == '118') {
		browser.screenshot_slide_scrot('imgversion/imgslide', slideindex, animator.get_eventindex(), true);
	    }
	    if (event.keyCode == '119') {
		browser.screenshot_slide_scrot('imgversion/imgslide', slideindex, animator.get_eventindex(), false);
	    }
	    if (event.keyCode == '114') {
		browser.shoot_thumbnails(navigator);
	    }
	    if (event.keyCode == '115') {
		browser.resize_thumbnails();
	    }
	    if (event.keyCode == '27' || event.keyCode == '116') {
		event.preventDefault();
		slideswitcher.setSwitchToSlideNavigation(slideindex, numslides);
	    }
	    if (event.keyCode == '9') {
		event.preventDefault();
		event.stopPropagation();
		eventeditor.setEditNavigation(slideindex);
	    }
	});
    }

    //Set navigation mode
    this.setPresentNavigation();

    this.is_advancing = function() {
	return advancing;
    }

    this.get_numslides = function() {
	return numslides;
    }

    this.getCurrentSlide = function() {
	return currentslide;
    }

    this.getCurrentID = function() {
	//console.log('Huh?: ' + currentslide);
	return currentslide.attr('id');
    }

    this.getSlideIndex = function() {
	return slideindex;
    }

    this.advance = function() {
	animator.finish_last_event();
	if (animator.more_events()) {
	    console.log('Event advance!');
	    this.event_advance();
	}
	else
	    this.slide_fade_advance();
    }

    this.previous = function() {
	if (animator.first_event())
	    this.slide_previous();
	else {
	    console.log('Event go back!');
	    this.event_previous();
	}
    }

    this.event_skip = function() {
	animator.finish_last_event();
	if (animator.more_events()) {
	    animator.run_current_event();
	    animator.finish_last_event();
	}
    }

    this.events_skip_to_end = function() {
	while (animator.more_events()) {
	    animator.run_current_event();
	    animator.finish_last_event();
	}
    }

    this.event_advance = function() {
	animator.run_current_event();
    }

    this.event_previous = function() {
	animator.reverse_last_event();
    }

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
    }

    this.setheadfoot(true);

    this.slide_fade_advance = function() {
	if(slideindex < numslides-1) {
	    nextslide.finish();
	    if(!advancing) {
		slideindex += 1;
		advancing = true;
		nextslide.css('z-index', 2);
		this.setheadfoot(false);
		controller.setslidenum(slideindex, numslides);
		controller.settitle(nextslide);
		animator.set_current_objs(next_objs);
		animator.set_currentslide(nextslide);
		//animator.run_current_event(); //Run first event to set properties
		console.log('Going to skip event');
		this.event_skip();
		console.log('Skipped event');

		nextslide.animate({'opacity': 1},
				  {'duration': 500,
				   'always': function() {
				       currentslide.remove();
				       currentslide = nextslide;
				       currentslide.css('z-index', 1);
				       console.log('Advance! Slideindex: ' + slideindex + ', Numslides: ' + numslides);
				       if (numslides > slideindex+1) {
					   nexts = slideparser.parse_slidenum(slideindex+1, 0, false);
					   nextslide = nexts['slide'];
					   next_objs = nexts['aux_objs'];
				       }
				       advancing = false;
				   }});
	    }
	}
    }

    this.slide_goto = function(new_slideindex) {
	while (advancing) {
	    sleep(0.01)
	}
	advancing = true;
	nextslide.finish();
	slideindex = new_slideindex;
	console.log('Goto slideindex!: ' + slideindex + ', Numslides: ' + numslides);
	var oldslide = currentslide;
	var oldslide2 = nextslide;
	currents = slideparser.parse_slidenum(slideindex, 2, false, true);
	currentslide = currents['slide'];
	animator.set_current_objs(currents['aux_objs']);
	oldslide.remove();
	oldslide2.remove();
	nexts = slideparser.parse_slidenum(slideindex+1, 0, false);
	nextslide = nexts['slide'];
	next_objs = nexts['aux_objs'];
	animator.set_currentslide(currentslide);
	//animator.run_current_event(); //Run first event to set properties
	this.event_skip();
	//this.events_skip_to_end();
	currentslide.css('opacity', 1);
	currentslide.css('z-index', 1);
	this.setheadfoot(true);
	controller.setslidenum(slideindex, numslides);
	controller.settitle(currentslide, true);
	advancing = false;
    }

    this.slide_previous = function() {
	if(slideindex > 0) {
	    nextslide.finish();
	    slideindex -= 1;
	    console.log('Previous! Slideindex: ' + slideindex + ', Numslides: ' + numslides);
	    var oldslide = currentslide;
	    var oldslide2 = nextslide;
	    currents = slideparser.parse_slidenum(slideindex, 2, false, true);
	    currentslide = currents['slide'];
	    animator.set_current_objs(currents['aux_objs']);
	    oldslide.remove();
	    oldslide2.remove();
	    nexts = slideparser.parse_slidenum(slideindex+1, 0, false);
	    nextslide = nexts['slide'];
	    next_objs = nexts['aux_objs'];
	    animator.set_currentslide(currentslide);
	    //animator.run_current_event(); //Run first event to set properties
	    this.events_skip_to_end();
	    currentslide.css('opacity', 1);
	    currentslide.css('z-index', 1);
	    this.setheadfoot(false);
	    controller.setslidenum(slideindex, numslides);
	    controller.settitle(currentslide, true);
	}
    }
}