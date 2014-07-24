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

$(window).load(
    function() {
	//Set resolution
	//Load XML and animations
	var slidexml = loadxml();
	var xml_slides = $(slidexml).find('slide');
	var htmlslides = $('#slidelist');

	var idmanager = new IDManager();
	idmanager.register_ids(slidexml);

	var animations = new Animations(idmanager, slidexml, htmlslides);
	var parser = new SlideParser(idmanager, animations, xml_slides, htmlslides);
	var controller = new GeneralController(xml_slides);
	var browser = new Browser();
	var navigator = new Navigator(animations, xml_slides, parser, controller, browser, slidexml, document);

	// Animation layout, 'horisontal' or 'vertical'
	var animlayout = 'horisontal';
	//var animlayout = 'vertical';
	var animnavigator = $('#animnavigator');

	if (animlayout == 'horisontal') {
	    animnavigator.css({'top': 0,
			       'left': dimensions[0]
			      });
	}
	else {
	    animnavigator.css({'top': dimensions[1],
			       'left': 0
			      });
	}

	/* Disable context menu for purposes of element selection within slides
	 * Not actually needed for presentation mode */
	htmlslides.bind('contextmenu', function() {
	    return false;
	});

	/*var canvas = $('#slidelist')[0]
	canvas.onselectstart = function () { return false; }*/

/*    function parseanim(anim) {

	if(anim.is('move')) {

	}
    }*/

/*    function parseslideanims(slideanims) {
	slideid = slideanims.attr('elt_id');
	animlist = new Array();
	slideanims.children().each(
	    function() {animlist.push(parse_animation($(this)));}
	);
	return animlist;
    }*/

/*    function loadanims() {
      slideelements = $(animxml).find('slide');
      slideelements.each(
	function() {
	  slelt = parseslideanims($(this));
	});
    }*/
	//loadslides(ids, htmlslides, parser);
	animations.animgc();
	//animations.set_pauses('d0');
	//slidepauses(ids, id_count, htmlslides, animations);
	//loadanims();
	/*var slidelist_both = loadslides();
	  var slidelist_xml = slidelist_both[0];
	  var slidelist_html = slidelist_both[1];*/

	//console.log(animdata['d0[0][1][alpha]']);
	//alert(animdata[d0]);

	/*animoutdata = {
	    'd0': [[{'action': 'pause', 'elt_id': 'd5'}
		   ]
		  ]};*/
	    /*'d0': [[{'action': 'move', 'elt_id': 'd5', 'delay': 0, 'x': 200, 'y': 200, 'duration': 1000},
		    {'action': 'fade', 'elt_id': 'd5', 'delay': 500, 'duration': 500, 'alpha': 0}],
		   [{'action': 'fade', 'elt_id': 'd5', 'delay': 0, 'duration': 500, 'alpha': 1}]]
	};*/
	/*animoutdata = {
	    'd0': [[{'action': 'move', 'elt_id': 'd5', 'delay': 0, 'x': 200, 'y': 200, 'duration': 1000, 'continuation': {'action': 'move', 'elt_id': 'd5', 'delay': 0, 'x': 0, 'y': 300, 'duration': 1000}},
		    {'action': 'fade', 'elt_id': 'd5', 'delay': 500, 'duration': 500, 'alpha': 0}],
		   [{'action': 'fade', 'elt_id': 'd5', 'delay': 0, 'duration': 500, 'alpha': 1}]]
	};*/

    //alert(animdata['d0'][0][0]['duration']);

    //console.log(animjson);



    //}
	/*jQuery.ajax({
            type: 'POST',
	    url: 'outxml',
	    async: false,
	    data: {xmlstring: xmldata},
	    dataType: 'json',
	    contentType: 'text/xml; charset=UTF-8',
	    processData: false
	}).done(function(msg) {
	    console.log("XML saved: " + msg);
	});*/

	/*var titlebox = $('#titlebox');
	var slidebox = $('#slidelist');
	var footerbox = $('#footerbox');
	var slideheight = slidebox.height();

	var allslides = $('.slide');
	var numslides = allslides.length;*/

	//browser.shoot_thumbnails(navigator);
	//browser.resize_thumbnails();

	

	// Hide most slides and aggregate individual selectors into slidelist
	/*var slidelist = new Array();
	allslides.each(function(i){
	    if (i != 0) {
		$(this).css('visibility', 'hidden');
	    }
	    $(this).css('z-index', 3-i);
	    slidelist[i] = $(this);
	});*/

    //Currently out
/*    function slideevent(id, elt, delay) {
	this.elt_id = id;
	this.elt = elt;
	this.delay = delay;
    }*/

	/*function loadanimnav() {
	    var navwidth = 80;
	    var navul = $('#animnavigator');
	    for (var i in slidelist) {
		slidenav = jQuery('<li/>', {
		    class: 'slidemarker'
		}).appendTo(navul);
		slidenav.append(document.createTextNode(slidelist[i].attr('data-title')));
		slidenav.css({'left': (i*navwidth)});
	    }
	    $('#animnavigator > li').width(navwidth);
	}*/

	//$('#d5').animate({left: '600px'}, 2000);
	/*console.log($('#d5').position());
	console.log($('#d5').offset());*/

	//loadanimnav();

    //var animations = new Array(numslides);
    // Testdata - slide 1
    /*animations[0] = [[new moveevent("thirdbullet", 0, 1000, 200, 200), new fadeevent("thirdbullet", 500, 500, 0)],
      [new fadeevent("thirdbullet", 0, 200, 1)]];*/
    // Testdata - slide 2
    //animations[1] = [];
    // Testdata - slide 3
    //animations[2] = [];

    /*var current = 0;
      var current_inter = 0;*/

    // JS slide-preprocessing
    //titlebox.html('<h1 id="title">' + slidelist[0].data('title') + '</h1>');

  //Currently out
/*    for (i = 0; i < slidelist.length; i++) {
	
    }*/

    // Place slides on top of each other for fading transitions
    /*allslides.position({
	my: "left top",
	at: "left top",
	of: "#slidelist"
	});*/

    // Set title
    /*function settitle(title) {
	titlebox.html('<h1 id="title">' + title + '</h1>');
	}*/

    // Change to previous slide
    /*function previous_slide() {
	if (current > 0) {
	    lcurrent = current;
	    slidelist[lcurrent-1].css('visibility', 'visible');
	    slidelist[lcurrent].css('visibility', 'hidden');
	    current--;
	    settitle(slidelist[current].data('title'));
	}
	}*/

    // Change to next slide
    /*function next_slide() {
	if (current < numslides-1) {
	    lcurrent = current;
	    slidelist[lcurrent+1].css('visibility', 'visible');
	    slidelist[lcurrent].fadeTo(200, 0, function(){
		slidelist[lcurrent].css('visibility', 'hidden');
		slidelist[lcurrent].fadeTo(0, 1);
	    });
	    current++;
	    titlebox.html('<h1 id="title">' + slidelist[current].data('title') + '</h1>');
	}
	}*/

    /*function next_event() {
      events = animations[current][current_inter];
      for (var i = 0; i < events.length; i++) {
	events[i].run();
      }
      current_inter++;
      }*/

    /*$(document).keydown(function(event) {
	if (event.keyCode == '32' || event.keyCode == '39' || event.keyCode == '34') {
	  if (current_inter < animations[current].length) {
	    next_event();
	  }
	  else {
	    next_slide();
	  }
	}
	if (event.keyCode == '8' || event.keyCode == '37' || event.keyCode == '33') {
	  previous_slide();
	}
	});*/
});
