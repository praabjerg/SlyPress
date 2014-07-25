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
    return min + Math.floor(Math.random() * (max - min + 1));
}

function SlideParser(idmanager, animations, xml_slides, html_slides) {
    var idmanager = idmanager;
    var animations = animations;
    var slideelements = xml_slides;
    var html_slides = html_slides;

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
    }

    this.parse_element = function(element, htmlparent, aux_objs, slide) {
	var parse_obj = this;
	var retelt = false;
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
	else if(element.is('mathtex')) {
	    var name = element.attr('name');
	    var split = "no"
	    var elt_split = element.attr('split');
	    if (elt_split) {
		var split = elt_split;
	    }
	    var formula = element.text();

	    /* Images will be generated if the info file does not exist */
	    jQuery.ajax({
		type: "POST",
		url: 'mathtex',
		data: {name: name, formula: formula, split: split},
		dataType: "json",
		async: false
	    });

	    var texelt;

	    if (split == "yes") {
		texelt = jQuery('<div/>', {
		    class: 'mathtex'
		}).appendTo(htmlparent);
	    }
	    else {
		texelt = jQuery('<img/>', {
		    class: 'mathtex',
		    src: 'math_imgs/' + name + '.png',
		    alt: name
		}).appendTo(htmlparent);
	    }
	    idmanager.apply_id(element, texelt);
	    retelt = texelt;

	    if (split == "yes") {
		var info;
		jQuery.ajax({
		    type: "GET",
		    url: 'math_imgs/' + name + '/info',
		    dataType: "text",
		    async: false,
		    success: function(data) {
			info = data;
		    }
		});

		var info = info.split('\n');
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
			    src: 'math_imgs/' + name + '/' + id + '.png',
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
	else if(element.is('text')) {
	    var styleclass = element.attr('class');
	    var textelt = jQuery('<div/>', {
		class: styleclass
	    }).appendTo(htmlparent);
	    idmanager.apply_id(element, textelt);
	    textelt.text(element.text());
	    retelt = textelt;
	}
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
	//Parse videos
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
	    if (existing_play.length == 0)
		animations.insert_event(slideid, [{'action': 'playvideo', 'id': id}], 1);
	}
	//Parse images
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
			     width = data[0],
			     height = data[1]
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
		data: {pyfile: pyfilename},
		success: function(pytrace) {
		    console.log('Successfully got trace! Creating visualizer with id: ' + vis_id);
		    var exvis = new ExecutionVisualizer(vis_id, pytrace,
							{embeddedMode: true,
							 codeDivWidth: codewidth});
		    aux_objs[vis_id] = exvis;
		    if(steps === undefined) {
			steps = exvis.curTrace.length;
		    }
		    var slideid = slide.attr('id');

		    var existing_steps = animations.stepActionsIndexes('pystep', slideid, vis_id);
		    if (existing_steps.length < steps) {
			var event_index = 0;
			//Add steps up to number from XML file
			if (existing_steps.length == 0) {
			    event_index = animations.numEvents(slideid);
			    console.log('Starting at event index: ' + event_index);
			}
			else {
			    event_index = existing_steps[existing_steps.length-1][0];
			    console.log('Adding steps: ' + existing_steps[existing_steps.length-1]);
			}
			animations.addStepEvents(slideid, (steps-existing_steps.length), [{'action': 'pystep', 'id': vis_id}], event_index);
		    }
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
	else if(element.is('title')) {}
	else {
	    htmlparent.append(document.createTextNode(element.text()));
	}

	if (!(retelt === false)) {
	    var z = element.attr('z-index');
	    if (z !== undefined)
		retelt.css('z-index', z);
	    retelt.addClass('bleamerelt');
	}
	return retelt;
    }

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
    }

    this.parse_slidenum = function(slidenum, z, opaque, prepend) {
	if(typeof(prepend)==='undefined') prepend = false;
	if(typeof(opaque)==='undefined') opaque = true;
	var aux_objs = {};
	var slelt = this.parse_slide($(slideelements[slidenum]), z, aux_objs, opaque, prepend);
	animations.set_pauses(slelt.attr('id'));
	return {'slide': slelt, 'aux_objs': aux_objs};
    }
}