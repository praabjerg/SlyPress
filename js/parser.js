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

function getRandom(min, max) {
    "use strict";
    return min + Math.floor(Math.random() * (max - min + 1));
}

/* Class for parsing slides
 */
function SlideParser(idmanager, animations, xml_slides, html_slides) {
    "use strict";
    var slideelements = xml_slides;

    /* Calculate and set elements to absolute positioning.
     */
    this.setEltsAbsolute = function(slelt) {
	var elts = slelt.find('.bleamerelt');
	//var elts = $('.bleamerelt');
	var abspositions = {};

	elts.each(function() {
	    var offset = $(this).offset();
	    var poffset = $(this).parent().offset();
	    abspositions[$(this).attr('id')] = [offset.top - poffset.top,
						offset.left - poffset.left,
						$(this).width(), $(this).height()];
	});

	elts.each(function() {
	    var eltid = $(this).attr('id');
	    //HACK! Do not apply absolute positioning to spans. It fucks up their top position.
	    //Also, inline-block is necessary for certain transforms.
	    if ($(this).is('span')) {
		$(this).css({'position': 'relative',
			     'display': 'inline-block',
			     'top': 0,
			     'left': 0});
	    }
	    else if ($(this).is('img') && $(this).hasClass('mathimg')) {
		$(this).css({'position': 'absolute'});
	    }
	    else if ($(this).is('img')) {
		$(this).css({'position': 'absolute',
			     'top': abspositions[eltid][0],
			     'left': abspositions[eltid][1]
			    });
	    }
	    else {
		$(this).css({'position': 'absolute',
			     'top': abspositions[eltid][0],
			     'left': abspositions[eltid][1],
			     'width': abspositions[eltid][2],
			     'height': abspositions[eltid][3]
			    });
	    }
	});
    };

    /* Parse XML element recursively
     * All animateable elements are given the class "bleamerelt"
     */
    this.parse_element = function(element, htmlparent, aux_objs, slide) {
	var parse_obj = this;
	var retelt = false;
        /* anim elements become spans
         */
	if(element.is('anim')) {
	    var animelt = jQuery('<span/>').appendTo(htmlparent);
	    retelt = animelt;
	    idmanager.apply_id(element, animelt);
	    //pause_element(element, animelt);
	    element.contents().each(
		function() {
		    parse_obj.parse_element($(this), animelt, aux_objs, slide);
		}
	    );
	}

        /* itemize elements become unordered lists.
           ul elements are given the class "bullets"
           li elements are given the class "bullet", and
           "bleamerelt", to allow them to be animated.
         */
	else if(element.is('itemize')) {
	    //eltcount += 1;
	    var itemizelt = jQuery('<ul/>', {
		class: 'bullets'
		//width: 900
	    }).appendTo(htmlparent);
	    retelt = itemizelt;
	    idmanager.apply_id(element, itemizelt);

	    element.children().each(
		function() {
		    //eltcount += 1;
		    if($(this).is('item')) {
			itelt = jQuery('<li/>', {
			    class: 'bullet bleamerelt'
			}).appendTo(itemizelt);

			idmanager.apply_id($(this), itelt);
			$(this).contents().each(
			    function() {
				parse_obj.parse_element($(this), itelt, aux_objs, slide);
			    }
			);
		    }
		});
	}

        /* mathtex elements are compiled with LaTeX and then inserted
         * as animateable imgs with the class "mathtex"
         */
	else if(element.is('mathtex')) {
	    var name = element.attr('name');
	    var split = "no";
	    var elt_split = element.attr('split');
	    if (elt_split) {
		split = elt_split;
	    }
	    var formula = element.text();

	    //Images will be generated if the info file does not exist
	    jQuery.ajax({
		type: "POST",
		url: 'latex',
		data: {name: name, preamble: '', formula: formula, dpi: 1500, split: split},
		dataType: "json",
		async: false
	    });

	    var texelt;

            //If we split the compiled image, we collect all the elements in a div
	    if (split == "yes") {
		texelt = jQuery('<div/>', {
		    class: 'mathtex'
		}).appendTo(htmlparent);
	    }

            //If we don't split it, we just put the image in its own img tag.
	    else {
		texelt = jQuery('<img/>', {
		    class: 'mathtex',
		    src: 'latex/imgs/' + name + '.png',
		    alt: name
		}).appendTo(htmlparent);
	    }
	    idmanager.apply_id(element, texelt);
	    retelt = texelt;

            /* If the image was split, we need to reed the resulting info file
             * to get the position of each of the sub-elements, and then insert
             * the images into the div with those coordinates.
             */
	    if (split == "yes") {
		var info;
		jQuery.ajax({
		    type: "GET",
		    url: 'latex/imgs/' + name + '/info',
		    dataType: "text",
		    async: false,
		    success: function(data) {
			info = data;
		    }
		});

		info = info.split('\n');
		var max_width = 0;
		var max_height = 0;

		$.each(info, function(index, elt_inf) {
		    var inf_array = elt_inf.split(' ');
		    if (inf_array[0].length > 0) {
			var id = inf_array[0];
			var width = inf_array[1];
			var height = inf_array[2];
			var cx = inf_array[3];
			var cy = inf_array[4];

			var imgelt = jQuery('<img/>', {
			    src: 'latex/imgs/' + name + '/' + id + '.png',
			    alt: name + '/' + id,
			}).appendTo(texelt);
			/* Make modifiable */
			imgelt.addClass('bleamerelt');
			imgelt.addClass('mathimg');
			imgelt.attr('id', name + '_' + id);

			imgelt.css({'width': width,
				    'height': height,
				    'top': cy + 'px',
				    'left': cx + 'px'});
			console.log('x: ' + cx);
			console.log('y: ' + cy);

			if (cx > max_width) {
			    max_width = cx;
			}
			if (cy > max_height) {
			    max_height = cy;
			}
		    }
		});
		texelt.css('width', max_width);
		texelt.css('height', max_height);
	    }
	}

        /* titlepage becomes a set of divs.
         * You can set the appropriate css properties through
         * the listed classes.
         */
	else if(element.is('titlepage')) {
	    var titleelt = jQuery('<div/>', {
		class: 'titlepage'
	    }).appendTo(htmlparent);
	    idmanager.apply_id(element, titleelt);
	    retelt = titleelt;

	    var prestitle = jQuery('<div/>', {
		class: 'prestitle'
	    }).appendTo(titleelt);
	    prestitle.text(element.children('prestitle').text());
	    jQuery('<br>').appendTo(titleelt);

	    var author = jQuery('<div/>', {
		class: 'author'
	    }).appendTo(titleelt);
	    author.text(element.children('author').text());
	    jQuery('<br>').appendTo(titleelt);

	    var inst = jQuery('<div/>', {
		class: 'institution'
	    }).appendTo(titleelt);
	    inst.text(element.children('inst').text());
	    jQuery('<br>').appendTo(titleelt);
	}

        /* text becomes a div with a custom class that you can
         * set in the XML. I am considering applying recursive
         * parsing to this, to allow for internal anim elements.
         */
	else if(element.is('text')) {
	    var styleclass = element.attr('class');
	    var textelt = jQuery('<div/>', {
		class: styleclass
	    }).appendTo(htmlparent);
	    idmanager.apply_id(element, textelt);
	    textelt.text(element.text());
	    retelt = textelt;
	}

        /* Content of code tags is stuffed into a pre element
         * and then styled with the snippet plugin, according
         * to the language set with the lang property.
         */
	else if(element.is('code')) {
	    var lang = element.attr('lang');
	    var source = element.attr('src');
	    var code;

	    jQuery.ajax({type: "GET",
			 url: source,
			 dataType: "text",
			 async: false,
			 success: function(data) {
			     code = data;
			 }
			});

	    var codeelt = jQuery('<pre/>').appendTo(htmlparent);
	    idmanager.apply_id(element, codeelt);
	    codeelt.text(code);
	    codeelt.snippet(lang, {style: "peachpuff", showNum: false});
	    retelt = codeelt;
	}

	/* Video tags are experimental. In theory, I think this should work,
         * but last time I attempted to use this in Chromium, it was somewhat
         * quirky.
         * The idea is that we add an event that will cause the video to play.
         */
	else if(element.is('video')) {
	    var source = element.attr('src');
	    var slideid = slide.attr('id');
	    var videoelt = jQuery('<video/>', {
		src: source
	    }).appendTo(htmlparent);
	    retelt = videoelt;
	    var res = idmanager.apply_id(element, videoelt);
	    var id = res[1];
	    var existing_play = animations.stepActionsIndexes('playvideo', slideid, id);
	    if (existing_play.length === 0)
		animations.insert_event(slideid, [{'action': 'playvideo', 'id': id}], 1);
	}

	/* img tags are translated to, well, img tags...
         * The content of the tag becomes the alt text in the HTML.
         * Since javascript does not necessarily know the size of
         * the image, we fetch this from a server-side python script.
         */
	else if(element.is('img')) {
	    //eltcount += 1;
	    var source = element.attr('src');
	    var alttext = element.text();
	    var width = 0;
	    var height = 0;
	    jQuery.ajax({type: "GET",
			 url: "get_image_size",
			 data: {imgname: source},
			 dataType: "json",
			 async: false,
			 success: function(data) {
			     width = data[0];
			     height = data[1];
			 }
	    });
	    var imgelt = jQuery('<img/>', {
		src: source,
		alt: alttext,
	    }).appendTo(htmlparent);
	    retelt = imgelt;
	    imgelt.css('height', height);
	    imgelt.css('width', width);
	    idmanager.apply_id(element, imgelt);
	}

        /* Box elements are fairly versatile. You can put a border
         * on them or set their background colour, and use them for
         * framing/highlighting things.
         * You can also embed elements in a box, and even use
         * overflow="hidden" to cut off visibility of inner elements
         * at the border.
         * Sub-elements are simply parsed recursively and can of
         * course be animated as well.
         */
	else if(element.is('box')) {
	    var overflow = element.attr('overflow');
	    var bgcolor = element.attr('bgcolor');
	    var border = element.attr('border');
	    var width = 400;
	    var height = 400;
	    if (element.attr('width'))
		width = element.attr('width');
	    if (element.attr('height'))
		height = element.attr('height');
	    var boxelt = jQuery('<div/>').appendTo(htmlparent);
	    if(overflow) {
		boxelt.css('overflow', overflow);
	    }
	    if(bgcolor) {
		boxelt.css('background-color', bgcolor);
	    }
	    if(border) {
		boxelt.css('border', border);
	    }

	    boxelt.css({'width': width, 'height': height});

	    retelt = boxelt;
	    idmanager.apply_id(element, boxelt);

	    // Parse the child elements
	    element.children().each(
		function() {
		    parse_obj.parse_element($(this), boxelt, aux_objs, slide);
		});

	}

        /* This was another video experiment, using an embedded
         * VLC player to stream video instead of the video tag.
         * This actually worked better than the video tag on the
         * version of Chromium I was using, but it was still somewhat
         * quirky.
         */
	else if(element.is('stream')) {
	    var source = element.attr('src');
	    var width = 800;
	    var height = 600;
	    if (element.attr('width'))
		width = element.attr('width');
	    if (element.attr('height'))
		height = element.attr('height');
	    var streamelt = jQuery('<embed/>', {
		type:"application/x-vlc-plugin",
		pluginspage:"http://www.videolan.org",
		name:"player",
		autoplay:"yes",
		loop:"no",
		width:width,
		height:height,
		controls:"false",
		target:source
	    }).appendTo(htmlparent);
	    streamelt.css('height', height);
	    streamelt.css('width', width);
	    retelt = streamelt;
	    idmanager.apply_id(element, streamelt);
	}

        /* Python tutor integration.
         */
	else if(element.is('pytutor')) {
	    var codewidth = 300;
	    if (element.attr('codewidth')) {
		codewidth = element.attr('codewidth');
	    }
	    tutorelt = jQuery('<div/>', {
		class: 'pytutor'
	    }).appendTo(htmlparent);
	    retelt = tutorelt;
	    idmanager.apply_id(element, tutorelt);
	    var pyfilename = element.attr('src');
	    var vis_id = element.attr('id');
	    var steps = element.attr('steps');
	    console.log('Visualizer id: ' + vis_id);
	    jQuery.ajax({
		url: 'pytutortrace',
                //The backend will generate an execution trace for the given Python file.
		data: {pyfile: pyfilename},
                //This trace is returned in pytrace
		success: function(pytrace) {
		    console.log('Successfully got trace! Creating visualizer with id: ' + vis_id);
                    //The trace is handed to the visualizer object
		    var exvis = new ExecutionVisualizer(vis_id, pytrace,
							{embeddedMode: true,
							 codeDivWidth: codewidth});

                    /* The visualizer object is stored in an array,
                     * which can be accessed during event execution.
                     */
		    aux_objs[vis_id] = exvis;

                    /* If the number of steps is undefined in the steps attribute,
                     * we count the trace length to get the maximum number of steps.
                     */
		    if(steps === undefined) {
			steps = exvis.curTrace.length;
		    }

		    var slideid = slide.attr('id');

                    /* Get the indices of any step actions already
                     * registered in the event list.
                     */
		    var existing_steps = animations.stepActionsIndexes('pystep', slideid, vis_id);
                    //If there are too few steps
		    if (existing_steps.length < steps) {
			var event_index = 0;
			//If there are no already registered step actions, start at the last event
			if (existing_steps.length === 0) {
			    event_index = animations.numEvents(slideid);
			    console.log('Starting at event index: ' + event_index);
			}
                        //Otherwise, start adding more steps after the last step event
			else {
			    event_index = existing_steps[existing_steps.length-1][0];
			    console.log('Adding steps: ' + existing_steps[existing_steps.length-1]);
			}
                        //Add the additional step events
			animations.addStepEvents(slideid, (steps-existing_steps.length), [{'action': 'pystep', 'id': vis_id}], event_index);
		    }
                    //If there are too many steps
		    else if (existing_steps.length > steps) {
			//Cull steps down to number from XML file
			var addnum = existing_steps.length - steps;
			var remnum = existing_steps.length - addnum;
			animations.removeActions(slideid, existing_steps.splice(0, remnum));
		    }
		    //For testing purposes
		    //animations.saveanims();
		},
		dataType: 'json',
		async: false
	    });
	}
        //Ignore title element (read elsewhere, not part of the actual slide)
	else if(element.is('title')) {}
        //For anything that's uninterpreted, just add the contents as text.
	else {
	    htmlparent.append(document.createTextNode(element.text()));
	}

        //If an HTML element was produced, add z-index, if found as an attribute
	if (retelt !== false) {
	    var z = element.attr('z-index');
	    if (z !== undefined)
		retelt.css('z-index', z);
	    retelt.addClass('bleamerelt');
	}

        //Return the generated HTML element
	return retelt;
    };

    /* Parse a slide
     */
    this.parse_slide = function(slide, z, aux_objs, opaque, prepend) {
	if(typeof(prepend)==='undefined') prepend = false;
	if(typeof(opaque)==='undefined') opaque = true;

        var slelt = jQuery('<li/>', {
	    class: 'slide'
	});

	slelt.css('z-index', z);
	if (opaque) {
	    slelt.css('opacity', 1);
	}

	if (prepend)
	    html_slides.prepend(slelt);
	else
	    html_slides.append(slelt);
	new_id_applied = idmanager.apply_id(slide, slelt);
	//New empty list for this slide's animations
	if(new_id_applied[0]) {
	    animations.newanims(new_id_applied[1]);
	    console.log('New ID applied to slide: ' + new_id_applied);
	}

	autolayoutelt = jQuery('<div/>', {
	    class: 'autolayout'
	}).appendTo(slelt);
	autolayoutelt.css('z-index', 0);

	//Add title to slide, if any
	title = slide.children('title');
	if(title.length > 0) {
	    slelt.attr('data-title', $(title[0]).text());
	}

	//animations.slidegc(slide); //Fix animation slots

        /* Parse elements on the slide
         * If inflow is "no" on an element, drop it as a root element of the slide
         * If it's "yes", pack it in the auto layout element.
         */
	var parse_obj = this;
	slide.children().each(
	    function() {
		if ($(this).attr('inflow') == 'no') {
		    elt = parse_obj.parse_element($(this), slelt, aux_objs, slide);
		    //console.log('Noflow element has z-index: ' + elt.css('z-index'));
		    if ((elt) && (elt.css('z-index') == 'auto'))
			elt.css({'z-index': -10,
				 position: 'absolute'
				});
		}
		else
		    parse_obj.parse_element($(this), autolayoutelt, aux_objs, slide);
	    }
	);

	centerheight(autolayoutelt);
	this.setEltsAbsolute(slelt);

	return slelt;
    };

    /* Parse slide number slidenum
     */
    this.parse_slidenum = function(slidenum, z, opaque, prepend) {
	if(typeof(prepend)==='undefined') prepend = false;
	if(typeof(opaque)==='undefined') opaque = true;
	var aux_objs = {};
	var slelt = this.parse_slide($(slideelements[slidenum]), z, aux_objs, opaque, prepend);
	animations.set_pauses(slelt.attr('id'));
	return {'slide': slelt, 'aux_objs': aux_objs};
    };
}
