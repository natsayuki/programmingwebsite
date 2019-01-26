import sys

test = sys.argv[1]
try:
    with open('userCode.py') as f:
        exec(f.read())
except:
    with open('python/userCode.py') as f:
        exec(f.read())

try:
    with open('tests/' + test) as f:
        exec(f.read())
except:
    with open('python/tests/' + test) as f:
        exec(f.read())


# Each test file must have a function called evalTest that returns True or False
# depending on if the user's function completed the tasks correctly

print(evalTest())
sys.stdout.flush()
