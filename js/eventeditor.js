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

function degToInt(rotstring) {
    if (rotstring != 0)
	return parseInt(rotstring.substring(0, rotstring.length-3));
    else
	return rotstring;
}

function pxToInt(pxstring) {
    if (pxstring != 0)
	return parseInt(pxstring.substring(0, pxstring.length-2));
    else
	return pxstring;
}

function ActionSelector(animator, mouse, body) {
    var animator = animator;
    var elementselector = undefined;
    var body = body;
    var actionselector = undefined;
    var top = 868;

    this.setElementSelector = function(eltsel) {
	//Aah! Cross-linking!
	elementselector = eltsel;
    }

    this.addActionRegulator = function(action, index, actionlist) {
	var event = event;
	var regulator = jQuery('<div/>', {
	    class: 'actionregulator'
	});
	regulator.data('eltid', action.id());
	regulator.data('type', action.actionname());
	regulator.appendTo(actionselector);
	regulator.css({'width': 20, 'left': (index*20)});
	var labelelt = jQuery('<div/>', {
	    class: 'actionlabel'
	});
	var labelback = jQuery('<div/>', {
	    class: 'labelback'
	});
	var durationelt = jQuery('<div/>', {
	    class: 'actionduration'
	});
	labelelt.text(action.actionname());
	labelback.appendTo(regulator);
	labelelt.appendTo(regulator);
	durationelt.appendTo(regulator);
	var top_css = 50+(action.delay/10);
	console.log('Regulator top: ' + top_css);
	var height_css = (action.duration/10);
	labelelt.css({'top': 5, 'width': 20, '-webkit-transform': 'rotate(90deg)'});
	labelback.css({'width': 20, 'height': 50, 'border-bottom': '2px solid black'});
	durationelt.css({'top': top_css, 'width': 20, 'height': height_css,
			 'border-top': '2px solid black', 'background-color': 'blue'});
	regulator.mouseenter(function() {
	    labelback.addClass('selectedaction');
	    elementselector.highlightframe(regulator.data('eltid'));
	});
	regulator.mouseleave(function() {
	    labelback.removeClass('selectedaction');
	    elementselector.unhighlightframe(regulator.data('eltid'));
	});

	regulator.bind('contextmenu', function() {
	    return false;
	});

	/*regulator.keydown(function (event) {
	    if(event.keyCode == 8) {
		console.log('Hitting backspace!');
		if(!event.shiftKey) {
		    regulator.remove();
		    //Actionlist is actually the real event!
		    $.each(actionlist, function(i, saction) {
			if((saction['action'] == action['action']) &&
			   (saction['id'] == action['id'])) {
			    action.reverse();
			    actionlist.splice(i, 1);
			}
		    });
		}
	    }
	});*/

	regulator.mousedown(function (event) {
	    event.preventDefault();
	    event.stopPropagation();
	    console.log('Regulator hit!');
	    var mouseorigY = mouse.y;
	    if(event.which == 1) {
		var oldpos = pxToInt(durationelt.css('top'));
		$(document).mousemove(function (event) {
		    var poschange = event.pageY-mouseorigY;
		    var newpos = oldpos + poschange;
		    if (newpos < 50)
			newpos = 50;
		    console.log('Regulator move!: ' + newpos);
		    durationelt.css('top', newpos);
		});
	    }
	    else if (event.which == 3) {
		var oldheight = pxToInt(durationelt.css('height'));
		$(document).mousemove(function (event) {
		    var heightchange = event.pageY-mouseorigY;
		    var newheight = oldheight + heightchange;
		    if (newheight < 0)
			newheight = 0;
		    durationelt.css('height', newheight);
		});
	    }
	});
	$(document).mouseup(function (event) {
	    if(event.which == 1) {
		$(document).unbind('mousemove');
		action.delay = (pxToInt(durationelt.css('top'))-50)*10;
		mouse.startRecord();
	    }
	    else if (event.which == 3) {
		$(document).unbind('mousemove');
		action.duration = pxToInt(durationelt.css('height'))*10;
		mouse.startRecord();
	    }
	});

	console.log('Regulator height: ' + height_css);
    }

    this.delActionRegulator = function(actionname, id) {
	actionselector.children().each(function () {
	    if (($(this).data('type') == actionname) && ($(this).data('eltid') == id)) {
		$(this).remove();
	    }
	});
    }

    this.clearAllActionRegulators = function() {
	actionselector.children().each(function () {
	    $(this).remove();
	});
    }

    this.updateActionSelection = function() {
	var actionlist = animator.getActionObjsFromLast();
	var actselectorobj = this;
	actionselector.children().each(function() {
	    $(this).remove();
	});
	var count = 0;
	$.each(actionlist, function(i, action) {
	    if ((action.actionname() != 'pystep') && (action.actionname() != 'pause')) {
		actselectorobj.addActionRegulator(action, count, actionlist);
		count += 1;
	    }
	});
    }

    this.setActionSelection = function() {
	actionselector = jQuery('<div/>', {
	    class: 'actionselector'
	}).appendTo(body);
	this.updateActionSelection();
	actionselector.animate({'opacity': 1}, 500);
	//actionselector.animate({'opacity', 1}, 500);
    }

    this.unsetActionSelection = function() {
	oldactionselector = actionselector;
	actionselector = undefined;
	oldactionselector.animate({'opacity': 0}, {'duration': 500,
						   'always': function() {
						       oldactionselector.remove();
						   }});
    }

    /*this.deleteSelectedAction = function() {
    }*/
}

function ElementSelector(animator, actionselector, mouse, eventeditor) {
    var mouse = mouse;
    var actionselector = actionselector;
    //Aaah! Cross-linking!
    actionselector.setElementSelector(this);
    var eventeditor = eventeditor;
    var animator = animator;
    var highlightelts = undefined;
    var origcss = undefined;
    var bleamerelts = undefined;
    var auxelts = undefined;
    var auxlist = undefined;
    var currentslide = undefined;
    var elementselector = this;

    var getid = function(elt) {
	if (elt.hasClass('auxelement')) {
	    console.log('Get data: ' + elt.data('eltid'));
	    return elt.data('eltid');
	}
	else
	    console.log('Get id: ' + elt.attr('id'));
	return elt.attr('id');
    }

    this.highlightframe = function(id) {
	highlightelts[id].addClass('highlightedframe');
	auxelts[id].addClass('highlightedframe');
    }

    this.unhighlightframe = function(id) {
	highlightelts[id].removeClass('highlightedframe');
	auxelts[id].removeClass('highlightedframe');
    }

    var highlight = function(event) {
	event.stopPropagation();
	var eltid = getid($(this));
	elementselector.highlightframe(eltid);
	console.log('Enter element: ' + eltid);
    }

    var unhighlightelt = function(elt) {
	var eltid = elt.attr('id');
	elementselector.unhighlightframe(eltid);
    }

    var unhighlight = function(event) {
	event.stopPropagation();
	var eltid = getid($(this));
	var elt = currentslide.find('#' + eltid);
	console.log('Leave element: ' + eltid);
	unhighlightelt(elt);
    }

    var select = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var eltid = getid($(this));
	var elt = currentslide.find('#' + eltid);
	if(event.which == 3) {
	    if(elt.hasClass('selected')) {
		elt.removeClass('selected');
		highlightelts[eltid].removeClass('selectedframe');
		auxelts[eltid].removeClass('selectedframe');
	    }
	    else {
		elt.addClass('selected');
		highlightelts[eltid].addClass('selectedframe');
		auxelts[eltid].addClass('selectedframe');
	    }
	}
    }

    var setSelectorCSS = function(html_elt, sel_elt) {
	var sel_parent = sel_elt.parent();
	var oldrot = degToInt(html_elt.css('rotate')) + 'deg';
	var oldrotX = degToInt(html_elt.css('rotateX')) + 'deg';
	var oldrotY = degToInt(html_elt.css('rotateY')) + 'deg';
	var oldscaleX = html_elt.css('scaleX');
	var oldscaleY = html_elt.css('scaleY');
	html_elt.css({'rotate': '0deg'});
	html_elt.css({'rotateX': '0deg'});
	html_elt.css({'rotateY': '0deg'});
	html_elt.css({'scaleX': 1});
	html_elt.css({'scaleY': 1});
	var htmlposition = html_elt.offset();
	html_elt.css({'rotate': oldrot});
	html_elt.css({'rotateX': oldrotX});
	html_elt.css({'rotateY': oldrotY});
	html_elt.css({'scaleX': oldscaleX});
	html_elt.css({'scaleY': oldscaleY});
	var selparentposition = sel_parent.offset();
	var relativeTop = htmlposition.top-selparentposition.top-4;
	var relativeLeft = htmlposition.left-selparentposition.left-4;
	var width = html_elt.width()+8;
	var height = html_elt.height()+8;
	console.log('Setting selector CSS: ' + html_elt.css('rotate'));
	sel_elt.css({
	    'position': 'absolute',
	    'left': relativeLeft,
	    'top': relativeTop,
	    'width': width,
	    'height': height,
	    'rotate': html_elt.css('rotate'),
	    'rotateX': html_elt.css('rotateX'),
	    'rotateY': html_elt.css('rotateY'),
	    'scaleX': html_elt.css('scaleX'),
	    'scaleY': html_elt.css('scaleY'),
	    'z-index': 0
	});
    }

    this.setSelectorsCSS = function() {
	bleamerelts.each(function() {
	    var eltid = $(this).attr('id');
	    var selelt = highlightelts[eltid];
	    setSelectorCSS($(this), selelt);
	});
    }

    this.makeSelector = function(html_elt, slide, selparent) {
	var selelt = undefined;
	if (html_elt.is('.bleamerelt')) {
	    selelt = jQuery('<div/>', {
		class: 'selectframe'
	    });
	    highlightelts[html_elt.attr('id')] = selelt;
	    if(html_elt.parent().is('.slide')) {
		selelt.css('z-index', html_elt.css('z-index')-1);
	    }
	    selelt.prependTo(selparent);
	    //selelt.prependTo(html_elt.parent());
	    setSelectorCSS(html_elt, selelt);

	    //Setup aux element list
	    auxelt = jQuery('<li/>', {
		class: 'auxelement'
	    }).appendTo(auxlist);
	    auxelts[html_elt.attr('id')] = auxelt;
	    auxelt.css({'width': 100,
			'height': 25});
	    auxelt.data('eltid', html_elt.attr('id'));
	}
	else {
	    selelt = slide;
	}

	var elementselector = this;
	html_elt.children().each(function() {
	    elementselector.makeSelector($(this), slide, selelt);
	});
    }

    this.setAuxSelect = function() {
    }

    this.setMouseSelect = function() {
	bleamerelts = currentslide.find('.bleamerelt');

	$.each(auxelts, function(i, auxelt) {$(auxelt).mouseover(highlight);
					     $(auxelt).mouseout(unhighlight);
					     $(auxelt).mousedown(select)});
	bleamerelts.mouseover(highlight);
	bleamerelts.mouseout(unhighlight);
	bleamerelts.mousedown(select);
    }

    this.setHoverSelection = function(slide) {
	currentslide = slide;
	bleamerelts = slide.find('.bleamerelt');
	highlightelts = {};
	auxelts = {};
	auxlist = jQuery('<ul/>', {
	    id: 'auxlist'
	}).appendTo($('body'));
	auxlist.css({'left': dimensions[0]+50,
		     'top': 100,
		     'position': 'absolute'});
	auxlist.bind('contextmenu', function() {
	    return false;
	});

	var elementselector = this;
	slide.children().each(function() {
	    elementselector.makeSelector($(this), slide, slide);
	});
	//Do this recursively instead
	/*bleamerelts.each(function() {
	    var selelt = undefined;
	    selelt = jQuery('<div/>', {
		class: 'selectframe'
	    });
	    highlightelts[$(this).attr('id')] = selelt;
	    var docposition = $(this).offset();
	    var slideposition = slide.offset();
	    var relativeTop = docposition.top-slideposition.top-4;
	    var relativeLeft = docposition.left-slideposition.left-4;
	    var width = $(this).width()+8;
	    var height = $(this).height()+8;
	    selelt.css({
		'left': relativeLeft,
		'top': relativeTop,
		'width': width,
		'height': height,
		'z-index': 0
	    });
	    if($(this).parent().is('.slide')) {
		selelt.css('z-index', $(this).css('z-index')-1);
	    }
	    selelt.prependTo(slide);

	    //Setup aux element list
	    auxelt = jQuery('<li/>', {
		class: 'auxelement'
	    }).appendTo(auxlist);
	    auxelts[$(this).attr('id')] = auxelt;
	    auxelt.css({'width': 100,
			'height': 25});
	    auxelt.data('eltid', $(this).attr('id'));
	});*/

	/* Create element-independent highlight, unhighlight and select functions
	 * These are applied also to the list of elements created on the right of the slide */

	this.setMouseSelect();
    }

    this.cancelManipulation = function() {
	/*bleamerelts.each(function(index, elt) {
	    elt.css(origcss[elt.attr('id')]);
	});
	this.setManipulationKeys();*/
    }

    /*this.readRots
    this.moveRots*/

    this.startManipulation = function(mantype) {
	var mouseorigX = mouse.x;
	var mouseorigY = mouse.y;
	var selected = $('.selected');
	var highlighters = {};
	var oldvals = {};
	console.log('Xorig: ' + mouseorigX);
	console.log('Yorig: ' + mouseorigY);

	var readfunc = function() {};
	var movefunc = function() {};
	var stopfunc = function() {};
	var cancfunc = function() {};

	//if(event.which == 1) {
	    //Stop manipulation and commit
	//}
	if(mantype == 'rotateZ') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = degToInt(elt.css('rotate'));
		console.log('Old rotation: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldval = oldvals[eltid];
		var newrot = (oldvals[eltid]+(event.pageX-mouseorigX)) + 'deg';
		elt.css({'rotate': newrot});
		highlighters[eltid].css({'rotate': newrot});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'rotateZ',
							       'deg': elt.css('rotate'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldrot = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.deg = elt.css('rotate');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		elt.css({'rotate': (oldvals[eltid] + 'deg')});
		highlighters[eltid].css({'rotate': (oldvals[eltid] + 'deg')});
	    }
	}
	if(mantype == 'rotateY') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = degToInt(elt.css('rotateY'));
		console.log('Old rotation: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldval = oldvals[eltid];
		var newrot = (oldvals[eltid]+(event.pageX-mouseorigX)) + 'deg';
		elt.css({'rotateY': newrot});
		highlighters[eltid].css({'rotateY': newrot});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'rotateY',
							       'deg': elt.css('rotateY'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldrot = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.deg = elt.css('rotateY');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		elt.css({'rotateY': (oldvals[eltid] + 'deg')});
		highlighters[eltid].css({'rotateY': (oldvals[eltid] + 'deg')});
	    }
	}
	if(mantype == 'rotateX') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = degToInt(elt.css('rotateX'));
		console.log('Old rotation: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldval = oldvals[eltid];
		var newrot = (oldvals[eltid]+(event.pageY-mouseorigY)) + 'deg';
		elt.css({'rotateX': newrot});
		highlighters[eltid].css({'rotateX': newrot});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'rotateX',
							       'deg': elt.css('rotateX'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldrot = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.deg = elt.css('rotateX');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		elt.css({'rotateX': (oldvals[eltid] + 'deg')});
		highlighters[eltid].css({'rotateX': (oldvals[eltid] + 'deg')});
	    }
	}
	if(mantype == 'move') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = [pxToInt(elt.css('left')), pxToInt(elt.css('top'))];
		console.log('Old position: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldleft = oldvals[eltid][0];
		var oldtop = oldvals[eltid][1];
		var newleft = (oldleft+(event.pageX-mouseorigX));
		var newtop = (oldtop+(event.pageY-mouseorigY));
		console.log('Moving, left: ' + newleft + ', top: ' + newtop);
		elt.css({'left': newleft, 'top': newtop});
		highlighters[eltid].css({'left': newleft, 'top': newtop});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'move',
							       'left': elt.css('left'),
							       'top': elt.css('top'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldleft = oldvals[eltid][0];
		    newaction.oldtop = oldvals[eltid][1];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.left = elt.css('left');
		    actionobj.top = elt.css('top');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldleft = oldvals[eltid][0];
		var oldtop = oldvals[eltid][1];
		elt.css({'left': oldleft,
			 'top': oldtop});
		highlighters[eltid].css({'left': oldleft,
					 'top': oldtop});
	    }
	}
	if(mantype == 'sizew') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = pxToInt(elt.css('width'));
		console.log('Old widthval: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldwidth = oldvals[eltid];
		var newwidth = (oldwidth+(event.pageX-mouseorigX));
		console.log('Widthing: ' + newwidth);
		elt.css({'width': newwidth});
		highlighters[eltid].css({'width': newwidth+8});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'sizew',
							       'width': elt.css('width'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldwidth = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.width = elt.css('width');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldwidth = oldvals[eltid];
		elt.css({'width': oldwidth});
		highlighters[eltid].css({'width': oldwidth});
	    }
	}
	if(mantype == 'sizeh') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = pxToInt(elt.css('height'));
		console.log('Old heightval: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldheight = oldvals[eltid];
		var newheight = (oldheight+(event.pageY-mouseorigY));
		console.log('Heighting: ' + newheight);
		elt.css({'height': newheight});
		highlighters[eltid].css({'height': newheight+8});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'sizeh',
							       'height': elt.css('height'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldheight = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.height = elt.css('height');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldheight = oldvals[eltid];
		elt.css({'height': oldheight});
		highlighters[eltid].css({'height': oldheight});
	    }
	}
	if(mantype == 'fade') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldval = elt.css('opacity');
		console.log('Old fadeval: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldfade = oldvals[eltid];
		var newfade = (parseFloat(oldfade)-parseFloat((event.pageY-mouseorigY)/100));
		console.log('Fading: ' + newfade);
		elt.css({'opacity': newfade});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'fade',
							       'opacity': elt.css('opacity'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldfade = oldvals[eltid];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.opacity = elt.css('opacity');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldfade = oldvals[eltid];
		elt.css({'opacity': oldfade});
	    }
	}
	if(mantype == 'scale') {
	    readfunc = function(elt) {
		var eltid = elt.attr('id');
		highlighters[eltid] = highlightelts[eltid];
		var oldval = [elt.css('scaleX'), elt.css('scaleY')];
		console.log('Old position: ' + oldval);
		oldvals[eltid] = oldval;
	    }
	    movefunc = function(event, elt) {
		var eltid = elt.attr('id');
		//console.log('Element: ' + eltid);
		var oldleft = oldvals[eltid][0];
		var oldtop = oldvals[eltid][1];
		var newleft = (parseFloat(oldleft)+parseFloat((event.pageX-mouseorigX)/100));
		var newtop = (parseFloat(oldtop)+parseFloat((event.pageX-mouseorigX)/100));
		console.log('Moving, left: ' + newleft + ', top: ' + newtop);
		elt.css({'scaleX': newleft, 'scaleY': newtop});
		highlighters[eltid].css({'scaleX': newleft, 'scaleY': newtop});
	    }
	    stopfunc = function(elt) {
		var eltid = elt.attr('id');
		var actionobj = animator.getActionObjFromLast(eltid, mantype);
		if (!actionobj) {
		    console.log('Did not get event object!');
		    var newaction = animator.objectify_action({'id': eltid, 'action': 'scale',
							       'scaleX': elt.css('scaleX'),
							       'scaleY': elt.css('scaleY'),
							       'duration': 500,
							       'delay': 0}, currentslide);
		    newaction.oldscaleX = oldvals[eltid][0];
		    newaction.oldscaleY = oldvals[eltid][1];
		    animator.insertActionObjToLast(newaction);
		}
		else {
		    actionobj.scaleX = elt.css('scaleX');
		    actionobj.scaleY = elt.css('scaleY');
		    console.log('Got action object: ' + actionobj);
		}
	    }
	    cancfunc = function(elt) {
		var eltid = elt.attr('id');
		var oldleft = oldvals[eltid][0];
		var oldtop = oldvals[eltid][1];
		elt.css({'scaleX': oldleft,
			 'scaleY': oldtop});
		highlighters[eltid].css({'scaleX': oldleft,
					 'scaleY': oldtop});
	    }
	}


	bleamerelts.unbind('mouseover');
	bleamerelts.unbind('mouseout');

	bleamerelts.each(function() {
	    unhighlightelt($(this));
	});
	selected.each(function() {
	    readfunc($(this));
	});
	$(document).mousemove(function(event) {
	    selected.each(function() {
		movefunc(event, $(this));
	    });
	});
	bleamerelts.unbind('mousedown');
	$(document).mousedown(function(event) {
	    selected.each(function() {
		if (event.which == 1) {
		    stopfunc($(this));
		    actionselector.updateActionSelection();
		}
	    });
	    //Same old same old
	    $(document).unbind('mousedown');
	    $(document).unbind('mousemove');
	    mouse.startRecord();
	    bleamerelts.mousedown(select);
	    bleamerelts.mouseover(highlight);
	    bleamerelts.mouseout(unhighlight);
	    eventeditor.setEditNavKeys();
	});
	$(document).keydown(function(event) {
	    if(event.keyCode == 27) {
		selected.each(function() {
		    cancfunc($(this));
		});
		//Same old same old
		$(document).unbind('mousedown');
		$(document).unbind('mousemove');
		mouse.startRecord();
		bleamerelts.mousedown(select);
		bleamerelts.mouseover(highlight);
		bleamerelts.mouseout(unhighlight);
		eventeditor.setEditNavKeys();
	    }
	});
    }

    /*this.startManipulation = function() {
      }*/

    this.setManipulationKeys = function() {
	var eltselector = this;
	bleamerelts.keydown(function(event) {
	    //'r' - rotate
	});
    }

    this.unsetHoverSelection = function(slide) {
	var bleamerelts = slide.find('.bleamerelt');
	$.each(highlightelts, function(index, elt) {
	    elt.remove();
	});
	auxlist.remove();
	$('.selected').removeClass('selected');
	//bleamerelts.each(function() {$(this).css('background-color', highlightelts[$(this).attr('id')])});
	bleamerelts.unbind('mouseover');
	bleamerelts.unbind('mouseout');
	bleamerelts.unbind('mousedown');
    }
}

function SlideSelector(numslides, navigator, animator, xml_slides, body) {
    var navigator = navigator;
    var selectorindex = 0;
//    var slideindex = 0;
    var numslides = numslides;

    var thumbheight = 100;
    var thumbwidth = Math.round((dimensions[0]/dimensions[1])*thumbheight);

    var listdiv = undefined;
    var indicator = undefined;
    var selector = undefined;

    this.selectorLeft = function() {
	if(selectorindex > 0) {
	    console.log('Going left!');
	    selectorindex -= 1;
	    this.slideListAnimate(selectorindex);
	}
    };

    this.selectorRight = function() {
	if(selectorindex < numslides-1) {
	    console.log('Going right!');
	    selectorindex += 1;
	    this.slideListAnimate(selectorindex);
	}
    };

    this.selectSlide = function() {
	//slideindex = selectorindex;
	animator.commitEvents();
	navigator.slide_goto(selectorindex);
	this.setIndicatorPos();
	//slideid = $(xml_slides[slideindex]).attr('id');
    };

    this.slideListSetPos = function(index) {
	var offset = (dimensions[0]/2)-(thumbwidth/2);
	var newleftpos = offset-(index*thumbwidth);
	listdiv.css('left', newleftpos);
    };

    this.slideListAnimate = function(index) {
	var offset = (dimensions[0]/2)-(thumbwidth/2);
	var newleftpos = offset-(index*thumbwidth);
	listdiv.animate({'left': newleftpos}, 100, 'linear');
    };

    this.setIndicatorPos = function() {
	indicator.css('left', (navigator.getSlideIndex()*thumbwidth));
    };

    this.setupSlideList = function() {
	listdiv = jQuery('<div/>', {
	    id: 'editorslidelist'
	}).prependTo(body);
	var slidecount = 0;
	xml_slides.each(function(index) {
	    var thumbelt = jQuery('<img/>', {
		class: 'editthumb',
		src: 'thumb/small_' + index + '.png',
		alt: 'slide_' + index
	    }).appendTo(listdiv);
	    thumbelt.css({'width': thumbwidth,
			  'left': (slidecount*thumbwidth)});
	    slidecount += 1;
	});
	indicator = jQuery('<div/>', {
	    id: 'slideindicator'
	}).appendTo(listdiv);
	selector = jQuery('<div/>', {
	    id: 'slideselector'
	}).appendTo(body);
	selectorindex = navigator.getSlideIndex();
	indicator.css({'height': thumbheight, 'width': thumbwidth});
	var offset = (dimensions[0]/2)-(thumbwidth/2);
	selector.css({'left': offset, 'height': thumbheight, 'width': thumbwidth});
	this.setIndicatorPos();
	listdiv.animate({top: 0}, 300);
	selector.animate({top: 0}, 300);
	console.log('Thumb width: ' + thumbwidth);
    };

    this.destroySlideList = function() {
	var oldlistdiv = listdiv;
	var oldselector = selector;
	oldlistdiv.animate({top: -100},
			   {'duration': 300,
			    'always': function() {
				oldlistdiv.remove();
			    }});
	oldselector.animate({top: -100},
			    {'duration': 300,
			     'always': function() {
				 oldselector.remove();
			     }});
    };
}

function EventSelector(animations, animator, navigator, elementselector, actionselector, body) {
    var animations = animations;
    var animator = animator;
    var actionselector = actionselector;
    var eventul = undefined;

    var eventheight = 30;
    var eventselector = undefined;
    //(Give single value between 0 and 1535, representing colour on the rainbow)
    this.colourGen = function(col) {
	var col = col;
	var step = 0;
	var R = 0;
	var G = 0;
	var B = 0;

	while(col > 255) {
	    col = col-256;
	    step += 1;
	    if (step >= 6) {
		step = 0;
	    }
	}

	if(step == 0) {
	    R = 255;
	    G = 0;
	    B = col;
	}
	else if(step == 1) {
	    R = 255-col;
	    G = 0;
	    B = 255;
	}
	else if(step == 2) {
	    R = 0;
	    G = col;
	    B = 255;
	}
	else if(step == 3) {
	    R = 0;
	    G = 255;
	    B = 255-col;
	}
	else if(step == 4) {
	    R = col;
	    G = 255;
	    B = 0;
	}
	else if(step == 5) {
	    R = 255;
	    G = 255-col;
	    B = 0;
	}

	return {'R': R, 'G': G, 'B': B};
    };

    this.setupEventList = function() {
	var slideid = navigator.getCurrentID();
	eventlist = animations.getslide(slideid);
	eventul = jQuery('<ul/>', {
	    id: 'editoreventlist'
	}).appendTo(body);
	var colourdistance = 0;
	var colour = 0;
	if (animations.numEvents(slideid) > 0)
	    colourdistance = Math.round(1536/animations.numEvents(slideid));
	console.log('Colour distance: ' + colourdistance);
	var editor = this;
	/*var initpos = jQuery('<li/>', {
	    class: 'eventitem'
	}).appendTo(eventul);
	initpos.css({'background-color': 'rgb(125, 125, 125)',
		     'height': eventheight});*/
	$.each(eventlist, function(index, event) {
	    var eventelt = jQuery('<li/>', {
		class: 'eventitem'
	    }).appendTo(eventul);
	    eventelt.css('height', eventheight);
	    rgb = editor.colourGen(colour);
	    rgbstring = 'rgb(' + rgb['R'] + ', ' + rgb['G'] + ', ' + rgb['B'] + ')';
	    console.log('Rainbow nr.: ' + colour);
	    console.log('RGB string: ' + rgbstring);
	    eventelt.css('background-color', rgbstring);
	    colour += colourdistance;
	});
	eventselector = jQuery('<li/>', {
	    id: 'eventselector'
	}).appendTo(eventul);
	eventselector.css({'height': eventheight,
			   'top': (animator.get_eventindex()*eventheight-eventheight)
			  });
    };

    this.showEventList = function() {
	eventul.animate({left: 0});
    };

    this.updateEventList = function() {
	eventul.remove();
	this.setupEventList();
	eventul.css('left', 0);
    };

    this.addEventBeforeThis = function() {
	var index = animator.get_eventindex();
	var count = 0;
	var editor = this;
	eventul.children('.eventitem').each(function() {
	    if(count == (index-1)) {
		var eventelt = jQuery('<li/>', {
		    class: 'eventitem'
		}).insertAfter($(this));
		eventelt.css('height', eventheight);
		rgb = editor.colourGen(Math.floor(Math.random()*1536));
		rgbstring = 'rgb(' + rgb['R'] + ', ' + rgb['G'] + ', ' + rgb['B'] + ')';
		eventelt.css('background-color', rgbstring);
	    }
	    count += 1;
	});
	animator.addEvent(index);
    };

    this.eventSelectorAnimate = function() {
	var topto = animator.get_eventindex()*eventheight;
	eventselector.animate({'top': topto-eventheight}, 50);
    };

    this.eventSelectorDown = function() {
	var slideid = navigator.getCurrentID();
	var eventindex = animator.get_eventindex();
	if (eventindex < (animator.numEvents())) {
	    animator.jump_current_event();
	    this.eventSelectorAnimate();
	}
	elementselector.setSelectorsCSS();
	actionselector.updateActionSelection();
	console.log('New event index: ' + animator.get_eventindex());
	console.log('Event list length: ' + animator.numEvents());
    };

    this.eventSelectorUp = function() {
	var eventindex = animator.get_eventindex();
	if (eventindex > 1) {
	    animator.reverse_last_event();
	    this.eventSelectorAnimate();
	}
	elementselector.setSelectorsCSS();
	actionselector.updateActionSelection();
	console.log('New event index: ' + animator.get_eventindex());
    };

    this.destroyEventList = function() {
	var oldeventul = eventul;
	oldeventul.animate({left: -50},
			   {'duration': 300,
			    'always': function() {
				oldeventul.remove();
			    }});
    };

    this.moveEventDown = function() {
	var eventindex = animator.get_eventindex();
	var moved = animator.moveEventDown();
	var movedelt;
	if (moved) {
	    movedelt = eventul.children().eq(eventindex-1).detach();
	    movedelt.insertAfter(eventul.children().eq(eventindex-1));
	    this.eventSelectorAnimate();
	}
    }

    this.moveEventUp = function() {
	var eventindex = animator.get_eventindex();
	var moved = animator.moveEventUp();
	var movedelt;
	if (moved) {
	    movedelt = eventul.children().eq(eventindex-1).detach();
	    movedelt.insertBefore(eventul.children().eq(eventindex-2));
	    this.eventSelectorAnimate();
	}
    }

    this.clearEvent = function() {
	var deleted_jumped = animator.clearLastEvent();
	var deleted = deleted_jumped[0];
	var jumped = deleted_jumped[1];
	if (deleted) {
	    var eventindex = animator.get_eventindex();
	    if(jumped)
		eventindex -= 1;
	    eventul.children().eq(eventindex).remove();
	}
	if (!jumped) {
	    this.eventSelectorAnimate();
	}
	actionselector.updateActionSelection();
    }

    /*this.deleteEvent = function() {
	var eventindex = animator.get_eventindex();
	animator.deleteLastEvent();
	if(eventindex > 1)
	else
	    actionselector.clearAllActionRegulators();
    }*/
}

function EventEditor(slidexml, document, numslides, xml_slides, slideparser, animations, animator, navigator) {
    var animator = animator;
    var numslides = numslides;
    var animations = animations;
    var navigator = navigator;
    var slidexml = slidexml;

    var document = document;

    var editpos = [50, 100];

    //var slideid = '';
    var body = $('body');

    var mouse = new Mouse();
    mouse.startRecord();
    var actionselector = new ActionSelector(animator, mouse, body);
    var elementselector = new ElementSelector(animator, actionselector, mouse, this);
    var slideselector = new SlideSelector(numslides, navigator, animator, xml_slides, body);
    var eventselector = new EventSelector(animations, animator, navigator, elementselector, actionselector, body);

    /*this.setSlideIds = function() {
	xml_slides.each(function() {
	    console.log('SlideID: ' + $(this).attr('id'));
	});
    }*/

    this.setEditNavKeys = function() {
	var eventeditor = this;
	$(document).keydown(function(event) {
	    event.stopPropagation();
	    event.preventDefault();

	    //Tab
	    if(event.keyCode == 9) {
		event.preventDefault();
		event.stopPropagation();
		eventeditor.unsetEditNavigation();
	    }
	    //Backspace
	    //Maltron: 8
	    if(event.keyCode == 90) {
		if (event.shiftKey)
		    eventselector.clearEvent();
		/*else
		    actionselector.deleteSelectedAction();*/
	    }
	    //Maltron: 78
	    if(event.keyCode == 65) {
		slideselector.selectorLeft();
	    }
	    //Maltron: 83
	    if(event.keyCode == 68) {
		slideselector.selectorRight();
	    }
	    //Maltron: 73
	    if(event.keyCode == 83) {
		if (event.shiftKey)
		    eventselector.addEventBeforeThis();
		else if (event.altKey)
		    eventselector.moveEventDown();
		else
		    eventselector.eventSelectorDown();
	    }
	    //Maltron: 89
	    if(event.keyCode == 87) {
		if (event.altKey)
		    eventselector.moveEventUp();
		else
		    eventselector.eventSelectorUp();
	    }
	    // Enter - select new slide
	    if(event.keyCode == 13) {
		slideselector.selectSlide();
		eventselector.updateEventList();
		elementselector.setHoverSelection(navigator.getCurrentSlide());
	    }
	});
	$(document).keydown(function () {
	    // 'r' - rotate
	    if(event.keyCode == 82) {
		$(document).unbind('keydown');
		elementselector.startManipulation('rotateZ');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // 'g' - grab
	    if(event.keyCode == 71) {
		$(document).unbind('keydown');
		elementselector.startManipulation('move');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // 'f' - fade
	    if(event.keyCode == 70) {
		$(document).unbind('keydown');
		elementselector.startManipulation('fade');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // 'c' - scale
	    // Maltron: 67
	    if(event.keyCode == 84) {
		$(document).unbind('keydown');
		elementselector.startManipulation('scale');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // Maltron: 76
	    if(event.keyCode == 89) {
		$(document).unbind('keydown');
		elementselector.startManipulation('rotateY');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // Maltron: 88
	    if(event.keyCode == 88) {
		$(document).unbind('keydown');
		elementselector.startManipulation('rotateX');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // Maltron: 87
	    if(event.keyCode == 69) {
		$(document).unbind('keydown');
		elementselector.startManipulation('sizew');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	    // Maltron: 72
	    if(event.keyCode == 81) {
		$(document).unbind('keydown');
		elementselector.startManipulation('sizeh');
		$(document).keydown(function(event) {
		    // Escape to quit transformation
		    if(event.keyCode == 27) {
			//No escape! Mwahahaha!
		    }
		});
		//eltselector.startManipulation();
	    }
	});
    };

    /*this.setManipulationKeys = function() {
    };*/

    this.setEditNavigation = function(index) {
	$(document).unbind('keydown');
	//slideindex = index;
	//slideid = $(xml_slides[slideindex]).attr('id');
	slideselector.setupSlideList();
	slideselector.slideListSetPos(navigator.getSlideIndex());
	eventselector.setupEventList();
	eventselector.showEventList();
	elementselector.setHoverSelection(navigator.getCurrentSlide());
	actionselector.setActionSelection();
	$('#slidebox').animate({top: editpos[1], left: editpos[0]}, 300);
	this.setEditNavKeys();
    };

    this.unsetEditNavigation = function() {
	animator.commitEvents();
	incrementbackup();
	animations.saveanims();
	savexml(slidexml);
	slideselector.destroySlideList();
	eventselector.destroyEventList();
	elementselector.unsetHoverSelection(navigator.getCurrentSlide());
	actionselector.unsetActionSelection();
	$('#slidebox').animate({top: 0, left: 0}, 300);
	$(document).unbind('keydown');
	$('#slidebox').unbind('keydown');
	navigator.setPresentNavigation();
    };
}