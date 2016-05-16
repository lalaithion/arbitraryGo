from OpenGL.GL import *
from OpenGL.GLUT import *

import random
import math

def distance(alpha,beta):
    '''
    Finds the distance between two points represented by two tuples.
    '''
    return math.sqrt((alpha[0]-beta[0])**2 + (alpha[1]-beta[1])**2)

def drawedge(alpha,beta):
    '''
    Draws a line between two points represented by two Point objects.
    '''
    glColor3f(0.087,0.082,0.071) 
    glPointSize(3)
    glBegin(GL_LINES)
    glVertex3f(alpha.x, alpha.y,0.0)
    glVertex3f(beta.x, beta.y,0.0)
    glEnd()

def generate_points(size):
    '''
    Generates a set of tuples (with a density represented by size) within the range (-1..1,-1..1)
    It does this using a dumber variant of Bridson's Algorithm for Poission Disc Sampling. 
    If would run in linear time rather than in quadratic time if it was implemented better
    '''
    firstpoint = (random.uniform(0,1),random.uniform(0,1))
    points = [firstpoint]
    active_points = [firstpoint]
    while len(active_points) > 0:
        test = random.choice(active_points)
        for i in range(10):
            r = random.uniform(0.5, 1)
            theta = random.uniform(0, 2*math.pi)
            x = math.cos(theta)*r + test[0]
            y = math.sin(theta)*r + test[1]
            if 0.2 > x or x > (size-0.2) or 0.2 > y  or y > (size-0.2):
                continue
            for i in points:
                valid = True
                if distance(i, (x,y)) < 0.5:
                    valid = False
                    break
            if not valid:
                continue
            active_points.append((x,y))
            points.append((x,y))
            break
        else:
            active_points.remove(test)  
    return [(p[0]/(0.5*size)-1,p[1]/(0.5*size)-1) for p in points]

def generate_edges(points,sparsity,scale):
    '''
    Generates a list of edges for the list of points given to it
    Only makes edges between nearby points for ease of reading/playing
    '''
    edges = []
    for current in points:
        possible = []
        idx = points.index(current)
        for other in points:
            if current.distance(other) < 2/scale:
                odx = points.index(other)
                possible.append(odx)
        for p in possible:
            if (idx,p) in edges or (p,idx) in edges:
                continue
            elif random.uniform(0, 1) < sparsity:
                edges.append((idx,p))
    return edges

class Point:
    '''
    This class represents a point, it's edges, and how to render it.
    '''
    blank = (0.174,0.164,0.142)
    black = (0.1,0.1,0.1)
    white = (0.9,0.9,0.9)
    player1 = 1
    player2 = 2
    empty = 0
    def __init__(self,xpos,ypos):
        self.x = xpos
        self.y = ypos
        self.edges = []
        self.color = Point.blank
        self.state = Point.empty
    def addEdge(self,other):
        self.edges.append(other)
    def changeState(self,newstate):     
        self.state = newstate
        if self.state == Point.empty:
            self.color = Point.blank
        elif self.state == Point.player1:
            self.color = Point.black
        elif self.state == Point.player2:
            self.color = Point.white
        else:
            raise ValueError
    def render(self,state=None):
        if state != None:
            if state == Point.player1:
                glColor3f(*Point.black)
            elif state == Point.player2:
                glColor3f(*Point.white)
        else:
            state = self.state
            glColor3f(*self.color)
        if state != Point.empty:
            glPointSize(50)
        else:
            glPointSize(10)
        glEnable(GL_POINT_SMOOTH)
        glBegin(GL_POINTS)
        glVertex2f(self.x, self.y)
        glEnd()
    def distance(self, other):
        return math.sqrt((self.x-other.x)**2 + (self.y-other.y)**2)
    def explore(self):
        for e in self.edges:
            sameplayer = self.state == e.state
            unexplored = not e.liberty
            if sameplayer and unexplored:
                e.liberty = True
                e.explore()

class LocalGraph:
    '''
    This is the base class of the entire board
    '''
    def __init__(self,size,sparsity,dim):
        self.dim = dim
        self.size = size
        self.points = generate_points(size)
        self.points = [Point(p[0],p[1]) for p in self.points]
        self.edges = generate_edges(self.points,sparsity,size)
        for e in self.edges:
            self.points[e[0]].addEdge(self.points[e[1]])
            self.points[e[1]].addEdge(self.points[e[0]])
        self.current = None
        self.turn = 1
    def render(self):
        glClearColor(0.87,0.82,0.71,1.0)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)     
        glLoadIdentity()
        for i in self.edges:
            drawedge(self.points[i[0]],self.points[i[1]])
        for i in self.points:
            if i == self.current and self.current.state == 0:
                if self.turn == 1:
                    i.render(1)
                else:
                    i.render(2)
            else:
                i.render()
        glutSwapBuffers()
    def update_active(self,x,y):
        mouse = Point(x/(0.5*self.dim)-1,1-y/(0.5*self.dim))
        smallest = self.points[0]
        for p in self.points:
            if mouse.distance(p) < mouse.distance(smallest):
                smallest = p
        self.current = smallest
    def click(self,button,state,x,y):
        if state == 0: #only do this on mouse down
            mouse = Point(x/(0.5*self.dim)-1,1-y/(0.5*self.dim))
            smallest = self.points[0]
            for p in self.points:
                if mouse.distance(p) < mouse.distance(smallest):
                    smallest = p
            self.current = smallest
            if self.current.state != 0:
                return
            if self.turn == 1:
                self.turn = 2
                self.current.changeState(1)
                self.capture()
            elif self.turn == 2:
                self.turn = 1
                self.current.changeState(2)
                self.capture()

    def capture(self,first=True):
        for p in self.points:
            p.liberty = False
        for p in self.points:
            if p.state in {1,2}:
                if p == self.current and first:
                    p.liberty = True
                    continue
                for e in p.edges:
                    if e.state == 0:
                        p.liberty = True
                        break
        for p in self.points:
            if p.liberty:
                p.explore()
        for p in self.points:
            if p.liberty == False:
                p.changeState(0)
        if first:
            self.capture(False)

if __name__ == "__main__":
    window_dim = 800
    board = LocalGraph(5,.4,window_dim)

    glutInit()
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_ALPHA | GLUT_DEPTH)
    glutInitWindowSize(window_dim, window_dim)
    glutInitWindowPosition(0, 0)
    window = glutCreateWindow("Game")

    glutDisplayFunc(board.render)
    glutIdleFunc(board.render) 
    glutPassiveMotionFunc(board.update_active)
    glutMouseFunc(board.click)


    glutMainLoop()