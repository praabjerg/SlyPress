from tornado import web, websocket, escape, httpserver, ioloop
from pngtex import latextopng
import os, re, shutil, splitmath, scipy, json
#import pythontutor
from pythontutor import generate_trace

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

class ImageSizeHandler(web.RequestHandler):
    def get(self):
        imgname = self.get_argument('imgname')
        image = scipy.misc.imread(imgname)
        self.write(json.dumps([image.shape[1], image.shape[0]]))

class PyTutorHandler(web.RequestHandler):
    def get(self):
        pyfile = self.get_argument('pyfile')
        self.write(generate_trace.get_json_trace(pyfile))

class LaTeXHandler(web.RequestHandler):
    def post(self):
        name = self.get_argument('name')
        preamble = self.get_argument('preamble')
        formula = self.get_argument('formula')
        dpi = self.get_argument('dpi')
        split = self.get_argument('split')
        force = False
        if (not os.path.isfile('latex/imgs/' + name + '.png')) or force:
            shutil.rmtree('latex/imgs/' + name, True)
            latextopng(name, preamble, formula, dpi)
        if (split == "yes"):
            print("Splitting!")
            splitmath.split_image(os.path.join('latex/imgs/', name + '.png'))

class SaveHandler(web.RequestHandler):
    def initialize(self, backupsys):
        self.backupsys = backupsys
    def post(self):
        animdata = self.get_argument('animdata')
        xmldata = self.get_argument('xmldata')
        with open('working.json', 'wb') as jsonfile, \
             open('working.xml', 'wb') as xmlfile:
            jsonfile.write(animdata.encode('utf-8'))
            xmlfile.write(xmldata.encode('utf-8'))
        self.backupsys.save(animdata, xmldata)
        self.write('Success!')

class SlyPressApplication(web.Application):
    def __init__(self):
        self.backupsys = BackupSys()

        handlers = [
            (r'/save', SaveHandler, {'backupsys': self.backupsys}),
            (r'/pytutortrace', PyTutorHandler),
            (r'/latex', LaTeXHandler),
            (r'/get_image_size', ImageSizeHandler),
            (r'/(.*)', web.StaticFileHandler, {"path": ""})
        ]

        web.Application.__init__(self, handlers)

if __name__ == '__main__':
    slypressapp = SlyPressApplication()
    server = httpserver.HTTPServer(slypressapp)
    server.listen(8080)
    ioloop.IOLoop.instance().start()
