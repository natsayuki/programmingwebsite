
# addOne is the fucntion to be evaluated

def target(a):
    return a + 1

def evalTest():
    for i in range(0, 1):
        if addOne(i) != target(i):
            return False
    return True
