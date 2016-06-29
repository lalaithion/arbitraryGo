from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *

import argparse

import go_rules
import go_ai

def rect(a, b, color):
    '''
    rect(a,b,color) :: ( (int,int) (int,int) (float,float,float) )
    rect draws a rectangle defined by corners 'a' and 'b' and colored 'color'
    '''
    glColor3f(*color)                                     
    glBegin(GL_QUADS)
    glVertex2f(*a)                                       
    glVertex2f(a[0], b[1]) 
    glVertex2f(*b)                                                   
    glVertex2f(b[0],a[1])              
    glEnd()


class Grid:
    def __init__(self,size,dim):
        '''
        init creates a go board with dimensions size * size in a window that is dim * dim.
        '''
        self.squares = [[ 
                  [(-1+2*(i/size),1-2*(j/size)),(-1+2*((i+1)/size),1-2*((j+1)/size)),0]
                  for i in range(size)]
                  for j in range(size)]
        self.size = size
        self.dim = dim
        self.current = None
        self.turn = 1
        self.ai = go_ai.rando_calrissian
        self.p1 = True

    def render(self):
        '''
        render draws every square and determines their color
        '''
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)     
        glLoadIdentity()
        for i, row in enumerate(self.squares):
            for j, sq in enumerate(row):
                if (self.active(i,j) and self.turn == 1 and self.squares[i][j][2] == 0) or sq[2] == 1:
                    rect(sq[0], sq[1], (0.1,0.1,0.1))
                elif (self.active(i,j) and self.turn == 2 and self.squares[i][j][2] == 0) or sq[2] == 2:
                    rect(sq[0], sq[1], (0.9,0.9,0.9))
                else:
                    rect(sq[0], sq[1], (0.87,0.82,0.71))
        glutSwapBuffers() 

    def capture(self,turn,x,y):
        '''
        capture refreshes the board to reflect any captures
        '''
        board = [[i[2] for i in j] for j in self.squares]
        go_rules.capture(board,turn,x,y)
        for i, row in enumerate(board):
            for j, sq in enumerate(row):
                self.squares[i][j][2] = sq

    def score(self):
        '''
        score determines the score of the board
        '''
        board = [[i[2] for i in j] for j in self.squares]
        return go_rules.score(board)

    def update_active(self,x,y):
        '''
        update_active determines which square the mouse is over
        '''
        col = (x-5)//(self.dim//self.size)
        row = (y-5)//(self.dim//self.size)
        self.current = (row,col)

    def active(self,x,y):
        '''
        active is a function that determines whether a square is under the mouse
        '''
        if (x,y) == self.current:
            return True
        return False

    def ai_play(self):
        board = [[i[2] for i in j] for j in self.squares]
        x,y = self.ai(board)
        self.turn = 1
        self.squares[x][y][2] = 2
        self.capture(2,x,y)

    def click(self,button,state,x,y):
        '''
        click updates the state of the game when the mouse is clicked.
        '''
        if state == 0: #only do this on mouse down
            col = (x-5)//(self.dim//self.size)
            row = (y-5)//(self.dim//self.size)
            if button == 2: #right click removes stone
                self.squares[row][col][2] = 0
            elif self.squares[row][col][2] == 0: #clicking on a spot with a stone already there does nothing
                if self.turn == 1:
                    self.turn = 2
                    self.squares[row][col][2] = 1
                    self.capture(1,row,col)
                    if self.p1 == True:
                        self.ai_play()
                else:
                    self.turn = 1
                    self.squares[row][col][2] = 2
                    self.capture(2,row,col)
            #print(self.score()) #Not implemented right now.

                                  
if __name__ == "__main__":

    window_dim = 800
    board = Grid(11,window_dim)

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