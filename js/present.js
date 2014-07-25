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

var KEYMAP = KEYMAPS['qwerty'];

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

	animations.animgc();
});
