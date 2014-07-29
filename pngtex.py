import os
from shutil import copytree, rmtree, move
from subprocess import call
import tempfile


def latextopng(name, preamble, code, dpi, targetdir='latex/imgs'):
    tempdir = tempfile.mkdtemp()
    with open('latex/template.tex', 'r') as f:
        template = f.read()
    mainstring = template.replace('<<formula>>', code)
    with open(tempdir + '/' + name + '.tex', 'w') as mainfile:
        mainfile.write(mainstring)
    call(["latex", name + ".tex"], cwd=tempdir)
    call(["dvipng", "-T", "tight", "-D", str(dpi), "-bg", "Transparent", "-o", name + ".png", name + ".dvi"], cwd=tempdir)
    #call(["convert", "-density", str(dpi), "-trim", name + ".pdf", name + ".png"])
    move(tempdir + '/' + name + '.png', targetdir)
    rmtree(tempdir)
