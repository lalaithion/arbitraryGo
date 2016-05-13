#TO DO: SCORE THE BOARD

import copy

def explore(liberty,x,y):
    directions = [(-1,0),(0,-1),(0,1),(1,0)]
    for d in directions:
        try:
            if (x+d[0] == -1) or (y+d[1] == -1):
                raise IndexError
            sameplayer = liberty[x][y][0] == liberty[x+d[0]][y+d[1]][0]
            unexplored = liberty[x+d[0]][y+d[1]][1] != True
            if sameplayer and unexplored:
                liberty[x+d[0]][y+d[1]][1] = True
                explore(liberty, x+d[0], y+d[1])
        except IndexError:
            pass


def capture(board,turn,x,y):
    '''
    capture(board,turn) :: ( [[int]] , int , int, int )
    This function takes a n x n list containing the values for each position on the board.
    A value of 0 means that the space is empty, and 1 and 2 represent the stones of the players.
    This function also takes a number marking which player has played last, and where.
    This function modifies the list in place such that any stones that would be captured are removed.
    '''
    liberty = [ [[j,False] for j in row] for row in board]
    directions = [(-1,0),(0,-1),(0,1),(1,0)]
    size = len(board)
    for i in range(size):
        for j in range(size):
            for d in directions:
                try:
                    if (i+d[0] == -1) or (j+d[1] == -1):
                        raise IndexError
                    if i == x and j == y:
                        liberty[i][j][1] = True
                    if liberty[i+d[0]][j+d[1]][0] == 0:
                        liberty[i][j][1] = True
                except IndexError:
                    pass
    for i in range(size):
        for j in range(size):
            if liberty[i][j][1] == True:
                explore(liberty,i,j)
    for i in range(size):
        for j in range(size):
            if liberty[i][j][1] == False:
                board[i][j] = 0
    if turn != 0:
        capture(board,0,-1,-1)

def score(board):
    '''
    score(board) :: ( [[int]] ) -> int
    This function takes a n x n list containing the values for each position on the board.
    A value of 0 means that the space is empty, and 1 and 2 represent the stones of the players.
    This function returns the score, calculated in any appropriate manner.
    The score will be positive if player 1 leads, and negative if player 2 leads.
    No komi will be factored into the score, not even a half point.
    '''
    return NotImplemented