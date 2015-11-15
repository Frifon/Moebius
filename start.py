from os import system
import argparse

database_name = 'app.db' # ?
database_create_script = 'db_create.py' # ?
start_script = 'run.py'
error_log = 'error'

def run(command):
    print (command)
    system(command)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--database', action='store_true')
    parser.add_argument('-p', '--port')
    args = parser.parse_args()

    if args.database:
        run("rm {0}/{1}".format(database_name))
        run("python3 {0}/{1}".format(database_create_script))
    if args.port:
        run("nohup python3 {0} --port={2} 1>{1} 2>&1 &".format(start_script, error_log, args.port))
    else:
        run("nohup python3 {0} 1>{1} 2>&1 &".format(start_script, error_log))