import argparse
from app import app

parser = argparse.ArgumentParser()
parser.add_argument('-p', '--port')
args = parser.parse_args()

if not args.port:
    args.port = 1234
app.run('0.0.0.0', int(args.port), debug=True)
