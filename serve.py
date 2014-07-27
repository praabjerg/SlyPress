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
import re
import shutil
from time import sleep

from pythontutor import generate_trace
from selenium import webdriver
import selenium.webdriver.chrome.options
from multiprocessing import Process
from scipy import misc
import cherrypy

from mathtex import compile_elt


jenc = json.JSONEncoder()


class BackupSys(object):
    backup_dir = 'backup'

    def __init__(self):
        self._num = 0
        existing = os.listdir(self.backup_dir)
        working_rx = re.compile(r'^working(\d+)\.(?:json|xml)$')
        for name in existing:
            match = working_rx.match(name)
            if match:
                self._num = max(self._num, int(match.group(1)))

    def save(self, animdata, xmldata):
        self._num += 1
        json_name = os.path.join(
            self.backup_dir, 'working{}.json'.format(self._num))
        xml_name = os.path.join(
            self.backup_dir, 'working{}.xml'.format(self._num))
        # Python 2/3-hack: Open in binary mode to get bytestrings rather than
        # unicode in Python 3; encode because we actually have unicode
        # objects...
        with open(json_name, 'wb') as jsonfile, \
                open(xml_name, 'wb') as xmlfile:
            jsonfile.write(animdata.encode('utf-8'))
            xmlfile.write(xmldata.encode('utf-8'))


class Bleamer(object):
    def __init__(self):
        self.backupsys = BackupSys()

        def loadpage(driver):
            sleep(2)
            driver.get('http://localhost:8080/present.html')

        chromedriver = './chromedriver'
        chrome_options =  selenium.webdriver.chrome.options.Options()
        chrome_options.add_argument('--test-type')
        chrome_options.add_argument('browser')
        os.environ['webdriver.chrome.driver'] = chromedriver
        print("Loading Chromium!")
        self.webdriver = webdriver.Chrome(
            chromedriver, chrome_options=chrome_options)
        pload = Process(target=loadpage, args=(self.webdriver,))
        pload.start()
        # self.webdriver.get('http://localhost:8080')

    @cherrypy.expose
    def save_screenshot(self, filename, nw, se):
        self.webdriver.get_screenshot_as_file(filename)
        nw = json.loads(nw)
        se = json.loads(se)
        print("Saving screenshot - nw: {}, se: {}, filename: {} ".format(
            nw, se, filename))
        uncropped = misc.imread(filename)
        min_x = nw[0]
        max_x = se[0]
        min_y = nw[1]
        max_y = se[1]
        cropped = uncropped[min_y:max_y, min_x:max_x]
        misc.imsave(filename, cropped)

    @cherrypy.expose
    def save_screenshot_scrot(self, filename, left):
        left = json.loads(left)
        print("Saving screenshot with scrot - filename: {}".format(filename))
        os.system('scrot ' + filename)
        if left:
            os.system('mogrify -crop 1280x800+0+1142 ' + filename)
        else:
            os.system('mogrify -crop 1280x800+632+1142 ' + filename)

    @cherrypy.expose
    def resize_thumbnails(self):
        imglist = os.listdir('thumb')
        for imagename in imglist:
            if imagename[:5] == 'slide':
                filename = 'thumb/' + imagename
                image = misc.imread(filename)
                smallimg = misc.imresize(image, (200, 267), 'bicubic')
                misc.imsave('thumb/small' + filename[11:], smallimg)

    @cherrypy.expose
    def get_image_size(self, imgname):
        image = misc.imread(imgname)
        # ydim, xdim, weird = image.shape
        return json.dumps([image.shape[1], image.shape[0]])

    @cherrypy.expose
    def pytutortrace(self, pyfile):
        return generate_trace.get_json_trace(pyfile)

    @cherrypy.expose
    def mathtex(self, name, formula, split):
        force = False
        if (not os.path.isfile('math_imgs/' + name + '.png')) or force:
            shutil.rmtree('math_imgs/' + name, True)
            compile_elt(name, formula, split)

    @cherrypy.expose
    def save(self, animdata, xmldata):
        # Python 2/3-hack: Open in binary mode to get bytestrings rather than
        # unicode in Python 3; encode because we actually have unicode
        # objects...
        with open('working.json', 'wb') as jsonfile, \
                open('working.xml', 'wb') as xmlfile:
            jsonfile.write(animdata.encode('utf-8'))
            xmlfile.write(xmldata.encode('utf-8'))
        self.backupsys.save(animdata, xmldata)
        return 'Success!'


config = {
    'global': {
        'server.socket_host': 'localhost',
        'server.socket_port': 8080,
    },
}


ROOT = os.path.abspath(os.path.dirname(__file__))


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


config['/'] = {
    'tools.staticdir.root': ROOT,
    'tools.trailing_slash.on': False,
}


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


# cherrypy.quickstart(root=Bleamer(), config="serve.conf")
cherrypy.quickstart(root=Bleamer(), config=config)
