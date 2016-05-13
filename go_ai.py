import random
import copy
import go_rules

def count(board):
    total = 0
    for row in board:
        for j in row:
            if j == 2:
                total += 1
    return total

def rando_calrissian(board):
    test = copy.deepcopy(board)
    size = len(board)
    x = random.choice(range(size))
    y = random.choice(range(size))
    while board[x][y] != 0:
        x = random.choice(range(size))
        y = random.choice(range(size))
    return x,y
