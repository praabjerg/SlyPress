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

function IDManager() {
    var ids = new Object();
    var id_count = {'d': 0,
		    'p': 0};

    this.register_ids = function(slidexml) {
	$(slidexml).find('*').each(
	    function(){
		if(!$(this).is('bleamer')) {
		    if($(this).attr('id')) {
			ids[$(this).attr('id')] = 1;
		    }
		    if($(this).attr('pid')) {
			ids[$(this).attr('pid')] = 1;
		    }
		}
	    });
    }

    this.new_id = function(prefix) {
	while(ids[(prefix + id_count[prefix])]) {
	    console.log('ID is used');
	    id_count[prefix] += 1;
	}
	var ret_id = (prefix + id_count[prefix]);
	id_count[prefix] += 1;
	ids[ret_id] = 1;
	return ret_id;
    }

    this.apply_id_to_xmlevent = function(xml_elt) {
	var xml_id = xml_elt.attr('id');
	if(!xml_id) {
	    var id = this.new_id('d');
	    console.log('Applying new event id to XML element');
	    xml_elt.attr('id', id);
	    return [true, id];
	}
	else {
	    return [false, xml_id];
	}
    }

    //If XML element has ID, apply this to HTML. Returns [false, id]
    //If not, apply a new ID instead. Returns [true, id]
    this.apply_id = function(xml_elt, html_elt) {
	var xml_id = xml_elt.attr('id');
	if(xml_id) {
	    html_elt.attr('id', xml_id);
	    return [false, xml_id];
	}
	else {
	    var id = this.new_id('d');
	    console.log('Applying new id: ' + id);
	    xml_elt.attr('id', id);
	    html_elt.attr('id', id);
	    return [true, id];
	}
    }

    this.apply_pause_id = function(xml_elt) {
	if (xml_elt.attr('pid')) {
	    return xml_elt.attr('pid');
	}
	else {
	    var pid = this.new_id('p');
	    xml_elt.attr('pid', pid);
	    return pid;
	}
    }
}