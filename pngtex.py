from os import chdir, getcwd
from shutil import copytree, rmtree, move
from subprocess import call
import sys

def latextopng(name, preamble, code, dpi, sourcedir='latex/packages', tempdir='latex/temp', targetdir='latex/imgs'):
    copytree(sourcedir, tempdir)
    with open('latex/template/docclass', 'r') as docclassfile, \
            open('latex/template/begindoc', 'r') as beginfile, \
            open('latex/template/enddoc', 'r') as endfile:
        docclass = docclassfile.read()
        begindoc = beginfile.read()
        enddoc = endfile.read()
    mainstring = docclass + "\n" + preamble + "\n" + begindoc + "\n" + code + "\n" + enddoc
    with open(tempdir + '/' + name + '.tex', 'w') as mainfile:
        mainfile.write(mainstring)
    olddir = getcwd()
    chdir(tempdir)
    call(["latex", name + ".tex"])
    call(["dvipng", "-T", "tight", "-D", str(dpi), "-bg", "Transparent", "-o", name + ".png", name + ".dvi"])
    #call(["convert", "-density", str(dpi), "-trim", name + ".pdf", name + ".png"])
    chdir(olddir)
    move(tempdir + '/' + name + '.png', targetdir)
    #rmtree(tempdir)
