from os import system

def run(command):
    print (command)
    system(command)

def shutdown():
    run("killall python2 python2.7 python python3 python3.2 python3.4 python3.5 Python")

if __name__ == "__main__":
    shutdown()