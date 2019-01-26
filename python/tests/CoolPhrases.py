
# someCoolPhrases is the function to be evaluated

def target(num):
    if num == 0:
        return "That's lit!"
    elif num == 1:
        return "Fortnite fam"
    elif num == 2:
        return "360 no scope"
    else:
        return "How do you do fellow kids?"

def evalTest():
    for i in range(0, 4):
        if someCoolPhrases(i) != target(i):
            return False
    return True
