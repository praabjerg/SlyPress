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

function SlideSwitcher(document, navigator) {
    var navigator = navigator;
    var numslides = 0;
    var thumbarray = new Array(7);
    var slideindex = 0;
    var switchelt = undefined;
    var document = document;
    var transforms = [
	{scale: 0.2, translateX: '-2100px', translateY: '-1500px', rotateY: '60deg', 'opacity': 0},
	{scale: 0.3, translateX: '-1200px', translateY: '-700px', rotateY: '60deg', 'opacity': 1},
	{scale: 0.4, translateX: '-750px', translateY: '-200px', rotateY: '60deg', 'opacity': 1},
	{scale: 0.65, translateX: '0px', translateY: '150px', rotateY: '0deg', 'opacity': 1},
	{scale: 0.4, translateX: '750px', translateY: '-200px', rotateY: '-60deg', 'opacity': 1},
	{scale: 0.3, translateX: '1200px', translateY: '-700px', rotateY: '-60deg', 'opacity': 1},
	{scale: 0.2, translateX: '2100px', translateY: '-1500px', rotateY: '-60deg', 'opacity': 0},
    ];
    var zindexes = [
	{'z-index': -3},
	{'z-index': -2},
	{'z-index': -1},
	{'z-index': 0},
	{'z-index': -1},
	{'z-index': -2},
	{'z-index': -3}
    ];

    var newImgElt = function(index) {
	if((index >= 0) && (index < numslides)) {
	    var imgelt = jQuery('<img/>', {
		class: 'thumbnail',
		src: 'thumb/slide_' + index + '.png',
		alt: 'slide_' + index
	    });
	    return imgelt;
	}
	else
	    return false;
    }

    this.setSwitchToSlideNavigation = function(sindex, nslides) {
	numslides = nslides;
	slideindex = sindex;
	$(document).unbind('keydown');
	var boxelt = $("#slidebox");
	switchelt = jQuery('<div/>', {
	    id: 'slideswitcher'
	}).prependTo(boxelt);

	//Initial insertion into appropriate places in array
	$.each(thumbarray, function(index) {
	    var thisslide = index-3+slideindex;
	    if((thisslide >= 0) && (thisslide < numslides)) {
		var imgelt = newImgElt(thisslide);
		imgelt.appendTo(switchelt);
		thumbarray[index] = imgelt;
		imgelt.animate(transforms[index], 0);
		imgelt.css(zindexes[index]);
	    }
	    else
		thumbarray[index] = false;
	    //var insert_index = slideindex-
	});
	var slideswitcher = this;
	$(document).keydown(function(event) {
            if (KEYMAP['next'].indexOf(event.keyCode) != -1) {
		slideswitcher.advance();
	    }
            if (KEYMAP['prev'].indexOf(event.keyCode) != -1) {
		slideswitcher.previous();
	    }
            if (KEYMAP['toggleswitcher'].indexOf(event.keyCode) != -1) {
		event.preventDefault();
		slideswitcher.destroySlideSwitcher();
	    }
	    /*if (event.keyCode == '190') {
		slideswitcher.destroySlideSwitcher();
	    }*/
	});
	switchelt.animate({'opacity': 1}, 500);
    }

    var setZIndex = function(index) {
	if(thumbarray[index])
	    thumbarray[index].css(zindexes[index]);
    }

    this.animateNext = function() {
	$.each(thumbarray, function(index) {
	    var elt = thumbarray[index];
	    if(elt) {
		elt.finish().animate(transforms[index], {'duration': 200,
							 'always': function() {
							     setZIndex(index);
							 },
							 'progress': function(animation, prog, remainingms) {
							     if (prog > 0.5)
								 setZIndex(index);
							 }});
	    }
	});
    }

    this.advance = function() {
	if(slideindex < numslides-1) {
	    $.each(thumbarray, function(index) {
		var thisslide = index-3+slideindex;
		var curelt = thumbarray[index];
		var imgelt = undefined;
		console.log('Thumb array ' + index + ': ' + thumbarray[index]);
		if(index == 0){
		    if(!(curelt === false)){
			curelt.remove();
		    }
		    imgelt = thumbarray[1];
		}
		else {
		    if(index == 6) {
			imgelt = newImgElt(thisslide+1);
			if (!(imgelt === false))
			    imgelt.appendTo(switchelt);
		    }
		    else
			imgelt = thumbarray[index+1];
		}
		thumbarray[index] = imgelt;
	    });
	    this.animateNext();
	    slideindex += 1;
	}
    }

    this.previous = function() {
	if(slideindex > 0) {
	    for (var index = 6; index >= 0; index--) {
		var thisslide = index-3+slideindex;
		var curelt = thumbarray[index];
		var imgelt = undefined;
		console.log('Going back! Thumb array ' + index + ': ' + thumbarray[index]);
		if(index == 6){
		    console.log('Index is 6');
		    if(!(curelt === false))
			curelt.remove();
		    imgelt = thumbarray[5];
		}
		else {
		    if(index == 0) {
			imgelt = newImgElt(thisslide-1);
			if (!(imgelt === false))
			    imgelt.prependTo(switchelt);
		    }
		    else
			imgelt = thumbarray[index-1];
		}
		thumbarray[index] = imgelt;
	    }
	    this.animateNext();
	    console.log('Slideindex before: ' + slideindex);
	    slideindex -= 1;
	    console.log('Slideindex after: ' + slideindex);
	}
    }

    this.destroySlideSwitcher = function() {
	navigator.slide_goto(slideindex);
	var oldswitchelt = switchelt;
	switchelt = undefined;
	oldswitchelt.animate({'opacity': 0}, {'duration': 500, 'complete': function() {
	    oldswitchelt.remove();
	}});
	$(document).unbind('keydown');
	navigator.setPresentNavigation();
    }

}

function GeneralController(xmlslides) {
    //var DOM = DOM;
    var xmlslides = xmlslides;
    var footerheight = 30;
    var titleheight = 80;
    var slideheight = dimensions[1];

    this.hidefooter = function(instant) {
	if(instant)
	    $('#footerbox').stop(true).css({'top': slideheight, 'opacity': 0});
	else
	    $('#footerbox').stop(true).delay(1000).animate({'top': slideheight, 'opacity': 0}, 1000);
    }

    this.showfooter = function(instant) {
	if(instant)
	    $('#footerbox').stop(true).css({'top': (slideheight-footerheight), 'opacity': 1});
	else
	    $('#footerbox').stop(true).animate({'top': (slideheight-footerheight), 'opacity': 1}, 1000);
    }

    this.hidetitle = function(instant) {
	if(instant)
	    $('#titlebox').stop(true).css({'top': (-titleheight), 'opacity': 0});
	else
	    $('#titlebox').stop(true).delay(1000).animate({'top': (-titleheight), 'opacity': 0}, 1000);
    }

    this.showtitle = function(instant) {
	if(instant)
	    $('#titlebox').stop(true).css({'top': 0, 'opacity': 1});
	else
	    $('#titlebox').stop(true).animate({'top': 0, 'opacity': 1}, 1000);
    }

    this.setslidenum = function(slideindex, numslides) {
	$('#slidenum').text((slideindex+1) + '/' + numslides);
    }

    this.settitle = function(slide, instantly) {
	if(typeof(instantly)==='undefined') instantly = false;
	var titlebox = $('#titlebox');
	var titlespan = titlebox.children().first();
	var newtitle = slide.attr('data-title');
	if(instantly) {
	    titlespan.text(newtitle);
	    titlespan.css('opacity', 1);
	}
	else {
	    newspan = jQuery('<span/>', {
		class: 'title'
	    }).prependTo(titlebox);
	    newspan.text(newtitle);
	    titlespan.animate({'opacity': 0}, {'duration': 500,
					       'complete': function() {
						   this.remove();
					       }});
	    newspan.animate({'opacity': 1}, {'duration': 500});
	}
    }
}