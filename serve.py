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


import json
import os
import shutil
from time import sleep

from pythontutor import generate_trace
from selenium import webdriver
from multiprocessing import Process
from scipy import misc
import cherrypy

from mathtex import compile_elt


jenc = json.JSONEncoder()

class BackupSys:
    def __init__(self):
        self.num = 0
        if os.path.exists('backup/num'):
            numfileread = open('backup/num')
            self.num = int(numfileread.readline())
            numfileread.close()
    def increment(self):
        self.num += 1
        numfilewrite = open('backup/num', 'w')
        numfilewrite.write(str(self.num))
        numfilewrite.close()
    def get_num(self):
        return self.num

class Bleamer:
    def __init__(self):
        self.backupsys = BackupSys()
        def loadpage(driver):
            sleep(2)
            driver.get('http://localhost:8080/present.html')
        chromedriver = './chromedriver'
        os.environ['webdriver.chrome.driver'] = chromedriver
        print("Loading Chromium!")
        self.webdriver = webdriver.Chrome(chromedriver)
        pload = Process(target=loadpage, args=(self.webdriver,))
        pload.start()
        #self.webdriver.get('http://localhost:8080')
    def save_screenshot(self, filename, nw, se):
        self.webdriver.get_screenshot_as_file(filename)
        nw = json.loads(nw)
        se = json.loads(se)
        print("Saving screenshot - " + "nw: " + str(nw) + ", se: " + str(se) + ", filename: " + filename + "\n")
        uncropped = misc.imread(filename)
        range_y = [nw[1], se[1]]
        range_x = [nw[0], se[0]]
        cropped = uncropped[range_y[0]:range_y[1], range_x[0]:range_x[1]]
        misc.imsave(filename, cropped)
    def save_screenshot_scrot(self, filename, left):
        left = json.loads(left)
        print("Saving screenshot with scrot - " + "filename: " + filename + "\n")
        os.system('scrot ' + filename)
        if left:
            os.system('mogrify -crop 1280x800+0+1142 ' + filename)
        else:
            os.system('mogrify -crop 1280x800+632+1142 ' + filename)
    def resize_thumbnails(self):
        imglist = os.listdir('thumb')
        for imagename in imglist:
            if imagename[:5] == 'slide':
                filename = 'thumb/' + imagename
                image = misc.imread(filename)
                smallimg = misc.imresize(image, (200, 267), 'bicubic')
                misc.imsave('thumb/small' + filename[11:], smallimg)
    def get_image_size(self, imgname):
        image = misc.imread(imgname)
        #ydim, xdim, weird = image.shape
        return json.dumps([image.shape[1], image.shape[0]]);
    def pytutortrace(self, pyfile):
        return generate_trace.get_json_trace(pyfile);
    def incrementbackup(self):
        self.backupsys.increment()
    def mathtex(self, name, formula, split):
        force = False
        if (not os.path.isfile('math_imgs/' + name + '.png')) or force:
            shutil.rmtree('math_imgs/' + name, True)
            compile_elt(name, formula, split)
    def outanims(self, animdata):
        #cherrypy.response.headers['Content-Type'] = 'application/json'
        f = open('working.json', 'w')
        backup = open('backup/working' + str(self.backupsys.get_num()) + '.json', 'w')
        f.write(animdata)
        backup.write(animdata)
        f.close()
        backup.close()
        return json.dumps('Success!')
    def outxml(self, xmlstring):
        outstring = xmlstring.encode('utf-8')
        #cherrypy.response.headers['Content-Type'] = 'application/json'
        f = open('working.xml', 'w')
        backup = open('backup/working' + str(self.backupsys.get_num()) + '.xml', 'w')
        f.write(outstring)
        backup.write(outstring)
        f.close()
        backup.close()
        return json.dumps('Success!')
    incrementbackup.exposed = True
    pytutortrace.exposed = True
    outanims.exposed = True
    outxml.exposed = True
    save_screenshot.exposed = True
    save_screenshot_scrot.exposed = True
    resize_thumbnails.exposed = True
    get_image_size.exposed = True
    mathtex.exposed = True
    #present.exposed = True


config = {
    'global': {
        'server.socket_host': 'localhost',
        'server.socket_port': 8080,
    },
}

ROOT = os.path.abspath(os.path.dirname(__file__))

config['/'] = {
    'tools.staticdir.root': ROOT,
    'tools.trailing_slash.on': False,
}
FILES = (
    'presentpre.html',
    'present.html',
    'source.xml',
    'working.xml',
    'working.json',
    'original.json',
    'bleamer.dtd',
)
DIRS = (
    'css',
    'js',
    'pythontutor',
    'python',
    'imgs',
    'math_imgs',
    'videos',
    'thumb',
)

for path in FILES:
    config['/' + path] = {
        'tools.staticfile.on': True,
        'tools.staticfile.filename': os.path.join(ROOT, path),
    }
for path in DIRS:
    config['/' + path] = {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': os.path.join(ROOT, path),
    }


#cherrypy.quickstart(root=Bleamer(), config="serve.conf")
cherrypy.quickstart(root=Bleamer(), config=config)
