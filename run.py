import argparse
from app import app

parser = argparse.ArgumentParser()
parser.add_argument('-p', '--port')
args = parser.parse_args()

app.run('0.0.0.0', int(args.port), debug=True)
