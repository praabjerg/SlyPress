#For analysis
from scipy import misc, ndimage
#For actual manipulation
import pygame, os, sys

class BoxedElement(object):
    def __init__(self, nw_co, se_co, xs, ys, im, impix, basename, num):
        nw_x, nw_y = nw_co
        se_x, se_y = se_co
        self.nw = nw_co
        self.ne = (se_x, nw_y)
        self.sw = (nw_x, se_y)
        self.se = se_co
        self.xs = xs
        self.ys = ys
        self.size = (se_x-nw_x+1, se_y-nw_y+1)
        self.offset = self.nw
        self.basename = basename
        self.num = num
        self.impix = impix
        self.im = im

    def contains_pixel(self, co):
        nw_x, nw_y = self.nw
        se_x, se_y = self.se
        x, y = co
        return ((x >= nw_x) and
                (x <= se_x) and
                (y >= nw_y) and
                (y <= se_y))

    def write(self, imgdir, auxfile):
        newsurf = pygame.Surface(self.size, flags=pygame.SRCALPHA)
        newpixarray = pygame.PixelArray(newsurf)

        sz_x, sz_y = self.size
        off_x, off_y = self.offset

        auxfile.write(str(self.num) + " " + str(sz_x) + " " +
                      str(sz_y) + " " + str(off_x) + " " + str(off_y)
                      + "\n")

        count = 0
        for x in self.xs:
            off_x, off_y = self.offset
            colour = self.im.unmap_rgb(self.impix[x][self.ys[count]])
            d_colour = dealias(colour, False)
            newpixarray[x-off_x][self.ys[count]-off_y] = d_colour
            count += 1
        modsurf = newpixarray.make_surface()
        pygame.image.save(modsurf, imgdir + "/" + self.basename + "/" + str(self.num) + ".png")

#    def write_element(self):

def dealias(colour, median=True):
    r, g, b, a = colour
    if median:
        if a < 128:
            newa = 0
        else:
            newa = 255
    else:
        newa = 255
    return (r, g, b, newa)

def highest_lowest(lst):
    lowest = lst[0]
    highest = lst[0]
    for elt in lst:
        if elt < lowest:
            lowest = elt
        if elt > highest:
            highest = elt
    return (lowest, highest)

def map_boxes(basename, impix, im):
    results = []
    count = 0
    #print('Hrm: ' + str(label_indices[0]))
    for index in label_indices:
        ys, xs = index
        #colour = impix[xs[0]][ys[0]]
        #colour = dealias(im.unmap_rgb(impix[xs[0]][ys[0]]), median=False)
        r, g, b, a = im.unmap_rgb(impix[xs[0]][ys[0]])
        colour = r, g, b, 255
        lo_x, hi_x = highest_lowest(xs)
        lo_y, hi_y = highest_lowest(ys)
        results.append(BoxedElement((lo_x, lo_y), (hi_x, hi_y), xs, ys, im, impix, basename, count))
        count += 1

    return results


#It seems slightly ridiculous to load the image twice, but scipy seems incapable of actually manipulating and saving an RGBA PNG correctly. And while pygame is pretty good at that, it has little to no built-in analysis capabilities.

if (len(sys.argv) > 1):
    imgdir = "math_imgs"
    nameext = sys.argv[1].rsplit(".", 1)
    imgname = nameext[0]
    extension = "." + nameext[1]
    imgfile = imgdir + "/" + imgname + extension
    #imgstrip = imgname + "_stripped" + extension

    if os.access(imgfile, os.F_OK):

        im_scipy = misc.imread(imgfile)

        im_pygame = pygame.image.load(imgfile)
        impix = pygame.PixelArray(im_pygame)

        labeled, num_features = ndimage.measurements.label(im_scipy)

        label_indices = [(labeled == i).nonzero() for i in xrange(1, num_features+1)]

        boxes = map_boxes(imgname, impix, im_pygame)

        if not os.access(imgdir, os.F_OK):
            os.mkdir(imgdir)
        if not os.access(imgdir + "/" + imgname, os.F_OK):
            os.mkdir(imgdir + "/" + imgname)
        auxfile = open(imgdir + "/" + imgname + "/info", "w")
        for box in boxes:
            box.write(imgdir, auxfile)
    else:
        print "File does not exist!"
    #print str((box.nw, box.se))
    #nw_x, nw_y = box.nw
    #se_x, se_y = box.se
    #impix[nw_x:se_x+1, nw_y:se_y+1] = 4282401023

    #newim = impix.make_surface()
    #pygame.image.save(newim, imgfile + "_stripped" + extension)
else:
    print "Needs a PNG file!"
