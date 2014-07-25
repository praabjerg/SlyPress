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

function loadfile(fname, ftype) {
    var filedata = null;
    jQuery.ajax({
	type: 'GET',
	url: fname,
	dataType: ftype,
	async: false,
	success: function(data) {
	    filedata = data;
	},
	error: function() {
	    filedata = false;
	}
    });
    return filedata;
}

//Stuff XML sheets into variables
function loadxml() {
    var slidexml = loadfile('working.xml', 'xml');
    if (!slidexml) {
	slidexml = loadfile('source.xml', 'xml');
    }
    if (!slidexml) {
	alert('Loading XML definitions failed!');
    }
    return slidexml;
}

function savexml(slidexml) {
    var xmldata = (new XMLSerializer()).serializeToString(slidexml);
    jQuery.post('outxml', {xmlstring: xmldata}, function(msg) {
	console.log("XML saved: " + msg);
    }, 'text');
}

function incrementbackup() {
    jQuery.ajax({
	type: 'GET',
	url: 'incrementbackup',
	async: false
    });
}