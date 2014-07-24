#    SlyPres is a slide presentation framework.
#    Copyright (C) 2014  Palle Raabjerg
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.

import os, math

def compile_img(name, packstring, filetype, dpi, formula):
    mathstr = packstring + '\\' + filetype + ' ' + '\\dpi{' + str(dpi) + '} ' + formula
    os.system('./mathtex "' + mathstr + '" -o ' + name)

def compile_elt(name, formula, split):
    scale = 750.0
    filetype = 'png'
    dpi = 1500
    usepackages = []
    homepath = os.path.join(os.path.abspath(os.path.dirname(__file__)), '')
    imgpath = 'math_imgs/'
    packstring = ''
    filename = name + '.' + filetype
    file = homepath + filename
    for pack in usepackages:
        packstring = packstring + '\\usepackage{' + homepath + pack + '} '

    compile_img(imgpath + name, packstring, filetype, dpi, formula)

    if (split == "yes"):
        print("Splitting!")
        os.system('python2 splitmath.py ' + filename)
        #with open(imgpath + name + '/info', 'r') as finfo:
        #    for line in finfo:
        #        infoarray = line.split(' ')
        #        num = infoarray[0]
        #        size_x = int(infoarray[1])
        #        size_y = int(infoarray[2])
        #        loc_x = int(infoarray[3])
        #        loc_y = int(infoarray[4])
        #        numpath = imgpath + name + '/' + num + '.' + filetype

                #load_image(numpath)
                #create_object(name, numpath, scale, (loc_x, loc_y))

#compile_elt('anequation', '\sqrt{x^2+y^2} = z', split=True)

#compile_img('anequation', '', 'png', 2000, '\sqrt{x^2+y^2} = z')
