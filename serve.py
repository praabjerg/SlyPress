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

import cherrypy, json, os, re, sys, types, traceback, shutil
from pythontutor import generate_trace
from cherrypy.lib.static import serve_file
from cherrypy import tools
from selenium import webdriver
from multiprocessing import Process
from time import sleep
from scipy import misc
from mathtex import compile_elt

from StringIO import StringIO

#win = graphics.GraphWin()

#list of disabled modules for Python Interpreter
modules = []

def uniq_id():
    try:
        from hashlib import md5
    except ImportError:
        import md5 as _md5
        md5 = _md5.new
    from time import time
    return md5(str(time())).hexdigest()

def check_env(env, modules):
    "prevent exec('import x'.replace('x', 'os'))"
    module_emsg = "For security reason you can't import '%s' module"
    fun_emsg = "For security reason you can't import functions from '%s' module"
    file_emsg = "For security reason you can't open files"
    for k, v in env.items():
        if type(v) == types.ModuleType and v.__name__ in modules:
            return module_emsg % v.__name__
        elif type(v) == types.FileType and not v.__class__ == StringIO:
            return file_emsg
        elif type(v) == types.BuiltinFunctionType and v.__module__ in modules:
            if v.__module__ == 'posix':
                module = 'os'
            elif v.__module__ == 'posixpath':
                module = 'path'
            else:
                module = v.__module__
            return fun_emsg % module

class InterpreterPersistent(object):
    def __init__(self):
        self.env = None

    def start(self):
        #Reset environment
        self.env = {}
        dummy_id = uniq_id()
        return dummy_id

    def info(self):
        msg = 'Type "help", "copyright", "credits" or "license" for more information.'
        return "Python %s on %s\n%s" % (sys.version, sys.platform, msg)

    def evaluate(self, session_id, code):
        try:
            fake_stdout = StringIO()
            #Redirect stdout to slide
            __stdout = sys.stdout
            sys.stdout = fake_stdout
            #ret = eval(code)
            ret = eval(code, self.env)
            result = fake_stdout.getvalue()
            #Rewire stdout to terminal
            sys.stdout = __stdout
            if ret != None:
                result += str(ret)
            return result
        except:
            try:
                #exec(code)
                exec(code, self.env)
            except:
                sys.stdout = __stdout
                buff = StringIO()
                traceback.print_exc(file=buff)
                stack = buff.getvalue().replace('"<string>"', '"<stdin>"').split('\n')
                return '\n'.join([stack[0]] + stack[3:])
            else:
                sys.stdout = __stdout
                return fake_stdout.getvalue()

    def evaluate_file(self, filename):
        fenv = {}
        fake_stdout = StringIO()
        #Redirect stdout to slide
        __stdout = sys.stdout
        sys.stdout = fake_stdout
        try:
            execfile(filename, fenv)
            #execfile(filename)
        except:
            sys.stdout = __stdout
            buff = StringIO()
            traceback.print_exc(file=buff)
            stack = buff.getvalue().replace('"<string>"', '"<stdin>"').split('\n')
            return '\n'.join([stack[0]] + stack[3:])
        else:
            sys.stdout = __stdout
            return fake_stdout.getvalue()

    def destroy(self, session_id):
        return True


class Interpreter(object):
    def start(self):
        session_id = uniq_id()
        open('pysession/session_%s.py' % session_id, 'w')
        return session_id

    def info(self):
        import sys
        msg = 'Type "help", "copyright", "credits" or "license" for more information.'
        return "Python %s on %s\n%s" % (sys.version, sys.platform, msg)

    def evaluate(self, session_id, code):
        global modules
        try:
            def no_import(module):
                raise "For security reason you can't use __import__"

            def no_open(filename, mode='r'):
                raise "For security reason you can open files"

            env = {'__import__': no_import, 'open': no_open, 'file': no_open}

            session_file = 'pysession/session_%s.py' % session_id
            fake_stdout = StringIO()
            __stdout = sys.stdout

            sys.stdout = fake_stdout
            exec(open(session_file), env)
            #don's show output from privous session
            fake_stdout.seek(0)
            fake_stdout.truncate()
            ret = eval(code, env)
            result = fake_stdout.getvalue()
            sys.stdout = __stdout
            msg = check_env(env, modules)
            if msg:
                return msg
            #if ret:
            result += str(ret)
            return result
        except:
            try:
                exec(code, env)
                #print(env)
            except:
                sys.stdout = __stdout
                import traceback
                buff = StringIO()
                traceback.print_exc(file=buff)
                #don't show rpc stack
                #stack = buff.getvalue().replace('"<string>"', '"<JSON-RPC>"').split('\n')
                stack = buff.getvalue().replace('"<string>"', '"<stdin>"').split('\n')
                return '\n'.join([stack[0]] + stack[3:])
            else:
                sys.stdout = __stdout
                msg = check_env(env, modules)
                if msg:
                    return msg
                open(session_file, 'a+').write('\n%s' % code)
                return fake_stdout.getvalue()

    def evaluate_file(self, filename):
        global modules
        def no_import(module):
            raise "For security reason you can't use __import__"

        def no_open(filename, mode='r'):
            raise "For security reason you can open files"

        env = {}

        #session_file = 'pysession/session_%s.py' % session_id
        fake_stdout = StringIO()
        __stdout = sys.stdout

        sys.stdout = fake_stdout
        try:
            execfile(filename, env)
        except:
            sys.stdout = __stdout
            import traceback
            buff = StringIO()
            traceback.print_exc(file=buff)
            #don't show rpc stack
            #stack = buff.getvalue().replace('"<string>"', '"<JSON-RPC>"').split('\n')
            stack = buff.getvalue().replace('"<string>"', '"<stdin>"').split('\n')
            return '\n'.join([stack[0]] + stack[3:])
        else:
            sys.stdout = __stdout
            msg = check_env(env, modules)
            if msg:
                return msg
            return fake_stdout.getvalue()


    def destroy(self, session_id):
        os.remove('pysession/session_%s.py' % session_id)

#from lxml import etree

jenc = json.JSONEncoder()
#thisdir = os.path.abspath(".")
#slidesize = [768, 1024]

pypreter = InterpreterPersistent()
session_id = pypreter.start()

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
        chromedriver = '/usr/lib/chromium-browser/chromedriver'
        os.environ['webdriver.chrome.driver'] = chromedriver
        print("Loading Chromium!")
        self.webdriver = webdriver.Chrome(chromedriver)
        pload = Process(target=loadpage, args=(self.webdriver,))
        pload.start()
        #self.webdriver.get('http://localhost:8080')
    def pysession_command(self, command):
        return json.dumps(pypreter.evaluate(session_id, command))
    def pysession_runfile(self, filename):
        return json.dumps(pypreter.evaluate_file("python/" + filename))
    def pysession_reset(self):
        pypreter.destroy(session_id)
        session_id = pypreter.start()
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
    pysession_command.exposed = True
    pysession_runfile.exposed = True
    pysession_reset.exposed = True
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

#cherrypy.quickstart(root=Bleamer(), config="serve.conf")
cherrypy.quickstart(root=Bleamer(), config="serve.conf")
