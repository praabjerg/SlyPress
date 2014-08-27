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

//var dimensions = [1280, 800];
var dimensions = [1024, 768];

/* Pad nr to size n with zeroes.
 * Used for writing out slide/event indexes for single screenshot filenames.
 */
function padLeft(nr, n){
    "use strict";
    return new Array(n-String(nr).length+1).join('0')+nr;
}

/* Class for tracking mouse position continuously.
 * Used in the EventEditor class for tracking the mouse
 * when moving elements around and adjusting their properties.
 */
function Mouse() {
    "use strict";
    this.x = 0;
    this.y = 0;

    this.startRecord = function() {
	var mouse = this;
	$(document).mousemove(function(event) {
	    mouse.x = event.pageX;
	    mouse.y = event.pageY;
	});
    };
}

/* Class representing browser functionality.
 * Mostly, this is concerned with taking screenshots from the interface.
 * We make calls to the backend Python scripts, which will then ask
 * Selenium WebDriver to take screenshots of the presentation.
 * This is used for generating thumbnails of the slides, but can
 * also be useful for creating a static version of the presentation.
 */
function Browser() {
    "use strict";
    var slidesize = dimensions;
    this.test_func = function() {
	console.log('Done did one screenshot!');
    };

    /* Screenshot area within browser. nw_arg and se_arg are arrays
     * with two elements, indicating coordinates of the nw corner and
     * the se corner.
     */
    this.screenshot_area = function(filename_arg, nw_arg, se_arg) {
	var browser = this;
	jQuery.ajax({type: "POST",
		     url: "save_screenshot",
		     data: {filename: filename_arg,
			    nw: JSON.stringify(nw_arg),
			    se: JSON.stringify(se_arg)},
		     dataType: "json",
		     async: true
		    });
    };

    /* Resize the fullscreen shots to actual thumbnail size (200x267)
     */
    this.resize_thumbnails = function() {
	jQuery.ajax({type: "POST",
		     url: "resize_thumbnails"
		    });
    };

    /* Screenshot the last event of each slide, and execute some continuation function.
     * This is used to generate images for both the slideswitcher and for the event editor.
     */
    this.shoot_slides = function(navigator, file_prefix, index, up_to, continuation) {
	var browser = this;
	//Go to end of slide
	navigator.slide_goto(index, true);
	var filename_arg = file_prefix + "_" + index + ".png";
	jQuery.ajax({type: "POST",
		     url: "save_screenshot",
		     data: {filename: filename_arg,
			    nw: JSON.stringify([0, 0]),
			    se: JSON.stringify([slidesize[0], slidesize[1]])},
		     dataType: "json",
		     async: true,
		     complete: function() {
			 if(index < up_to)
			     browser.shoot_slides(navigator, file_prefix, index+1, up_to, continuation);
			 else {
			     navigator.slide_goto(0, false);
                             continuation();
                         }
		     }
		    });
    };

    /* Screenshot one slide, store in screenshots/ with the name
     * imgslide<slideindex><eventindex>.png
     */
    this.screenshot_slide = function(filename, slide, eventindex) {
	var postfixed = filename + padLeft(slide, 3) + padLeft(eventindex, 3) + '.png';
	this.screenshot_area(postfixed, [0, 0], [slidesize[0], slidesize[1]]);
    };

    this.screenshot_slide_scrot = function(filename, slide, eventindex, left) {
	var postfixed = filename + padLeft(slide, 3) + padLeft(eventindex, 3) + '.png';
	browser = this;
	jQuery.ajax({type: "POST",
		     url: "save_screenshot_scrot",
		     data: {filename: postfixed,
			    left: JSON.stringify(left)},
		     dataType: "json",
		     async: true
		    });
    };

    /* Call shoot_slides with the resize_thumbnails function to screenshot the
     * the last event of each slide, and then resize them for thumbnails.
     */
    this.shoot_thumbnails = function(navigator) {
	var numslides = navigator.get_numslides();
        var browser = this;
	this.shoot_slides(navigator, 'thumb/slide', 0, numslides-1,
                          function() {browser.resize_thumbnails();});
	//this.resize_thumbnails();
    };
}
