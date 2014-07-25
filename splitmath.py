import os
import sys
# For analysis
from scipy import misc, ndimage
# For actual manipulation
import pygame


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

        for x, y in zip(self.xs, self.ys):
            off_x, off_y = self.offset
            colour = self.im.unmap_rgb(self.impix[x][y])
            newpixarray[x-off_x][y-off_y] = colour
        modsurf = newpixarray.make_surface()
        pygame.image.save(
            modsurf,
            imgdir + "/" + self.basename + "/" + str(self.num) + ".png")


def map_boxes(basename, label_indices, impix, im):
    results = []
    for count, index in enumerate(label_indices):
        ys, xs = index
        r, g, b, a = im.unmap_rgb(impix[xs[0]][ys[0]])
        lo_x = min(xs)
        hi_x = max(xs)
        lo_y = min(ys)
        hi_y = max(ys)
        results.append(
            BoxedElement(
                (lo_x, lo_y),
                (hi_x, hi_y),
                xs, ys,
                im, impix, basename, count))

    return results


# It seems slightly ridiculous to load the image twice, but scipy seems
# incapable of actually manipulating and saving an RGBA PNG correctly. And
# while pygame is pretty good at that, it has little to no built-in analysis
# capabilities.
def split_image(imgfile):
    imgdir = os.path.dirname(imgfile)
    basename = os.path.basename(imgfile)
    imgname, extension = os.path.splitext(basename)

    if os.access(imgfile, os.F_OK):

        im_scipy = misc.imread(imgfile)

        im_pygame = pygame.image.load(imgfile)
        impix = pygame.PixelArray(im_pygame)

        labeled, num_features = ndimage.measurements.label(im_scipy)

        label_indices = [
            (labeled == i).nonzero() for i in xrange(1, num_features+1)
        ]

        boxes = map_boxes(imgname, label_indices, impix, im_pygame)

        if not os.access(imgdir, os.F_OK):
            os.mkdir(imgdir)
        if not os.access(imgdir + "/" + imgname, os.F_OK):
            os.mkdir(imgdir + "/" + imgname)
        auxfile = open(imgdir + "/" + imgname + "/info", "w")
        for box in boxes:
            box.write(imgdir, auxfile)
    else:
        print "File does not exist!"


def main():
    if (len(sys.argv) > 1):
        return split_image(sys.argv[1])
    else:
        print "Needs a PNG file!"


if __name__ == '__main__':
    main()
