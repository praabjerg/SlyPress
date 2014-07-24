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
var dimensions = [1024, 768]

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

function Mouse() {
    this.x = 0;
    this.y = 0;

    this.startRecord = function() {
	var mouse = this;
	$(document).mousemove(function(event) {
	    mouse.x = event.pageX;
	    mouse.y = event.pageY;
	});
    }
}

function Browser() {
    slidesize = dimensions;
    this.test_func = function() {
	console.log('Done did one screenshot!');
    }

    this.screenshot_area = function(filename_arg, nw_arg, se_arg) {
	browser = this;
	jQuery.ajax({type: "POST",
		     url: "save_screenshot",
		     data: {filename: filename_arg,
			    nw: JSON.stringify(nw_arg),
			    se: JSON.stringify(se_arg)},
		     dataType: "json",
		     async: true
		    });
    }

    this.resize_thumbnails = function() {
	jQuery.ajax({type: "POST",
		     url: "resize_thumbnails"
		    });
    }

    this.shoot_slides = function(navigator, file_prefix, index, up_to) {
	browser = this;
	navigator.slide_goto(index);
	navigator.events_skip_to_end();
	filename_arg = file_prefix + "_" + index + ".png";
	jQuery.ajax({type: "POST",
		     url: "save_screenshot",
		     data: {filename: filename_arg,
			    nw: JSON.stringify([0, 0]),
			    se: JSON.stringify([slidesize[0], slidesize[1]])},
		     dataType: "json",
		     async: true,
		     complete: function() {
			 if(index < up_to)
			     browser.shoot_slides(navigator, file_prefix, index+1, up_to);
			 else
			     navigator.slide_goto(0);
		     }
		    });
    }

    this.screenshot_slide = function(filename, slide, eventindex) {
	var postfixed = filename + padLeft(slide, 3) + padLeft(eventindex, 3) + '.png';
	this.screenshot_area(postfixed, [0, 0], [slidesize[0], slidesize[1]]);
    }

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
    }

    this.shoot_thumbnails = function(navigator) {
	var numslides = navigator.get_numslides();
	this.shoot_slides(navigator, 'thumb/slide', 0, numslides-1);
	/*for(i = 0; i <= numslides-1; i++) {
	    navigator.slide_goto(i);
	    navigator.events_skip_to_end();
	    //alert('Uuuh?');
	    //this.screenshot_slide('thumb/slide_' + i + '.png');
	}*/
	//navigator.slide_goto(0);
	this.resize_thumbnails();
    }
}