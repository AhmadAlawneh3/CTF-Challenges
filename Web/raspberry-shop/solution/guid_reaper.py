#!/bin/env python3

import argparse
import datetime
import re
import sys
import uuid

###############################################################################
# Based off of Daniel Thatcher's guid tool
# Additional reading from https://duo.com/labs/tech-notes/breaking-down-uuids
###############################################################################

# A nano second is a billionth of a second, so...
# 1 second = 1e7 100-nanosecond intervals
NANO_INTERVAL = 1e7

def uuid_time(uid):
	# Gregorian reform to the Christian calendar (Oct 15, 1582)
	# See https://datatracker.ietf.org/doc/html/rfc4122#section-4.2.2
	dt_base = datetime.datetime( 1582, 10, 15 )
	return dt_base + datetime.timedelta(microseconds=uid.time//10)

def uuid_mac(uid):
	return ":".join(re.findall('..', '%012x' % uid.node))

def dump_guid(guid):
	try:
		uid = uuid.UUID(guid)
	except ValueError:
		print("Invalid GUID")
		sys.exit(2)

	print ("\tGUID version: {}".format(uid.version))

	if uid.version == 1:
		t = uuid_time(uid)
		print("\tTime: {}".format(t))
		print("\tTimestamp: {}".format(uid.time))
		print("\tNode: {}".format(uid.node))
		m = uuid_mac(uid)
		print("\tMAC address: {}".format(m))
		print("\tClock sequence: {}".format(uid.clock_seq))

def uuid1(node, clock_seq, timestamp):
	time_low = timestamp & 0xffffffff
	time_mid = (timestamp >> 32) & 0xffff
	time_hi_version = (timestamp >> 48) & 0x0fff
	clock_seq_low = clock_seq & 0xff
	clock_seq_hi_variant = (clock_seq >> 8) & 0x3f
	return uuid.UUID(fields=(time_low, time_mid, time_hi_version,
		clock_seq_hi_variant, clock_seq_low, node), version=1)

def get_precision(timestamp):
	# Determine the precision by looking at how many 0 are at the end 
	# of the previously captured timestamp
	ts = str(timestamp)
	l = len(ts) - len(ts.rstrip('0'))
	return int("1".ljust(l+1, '0'))

def gen_guids(sample_guid, estimated_ts):
	uid = uuid.UUID(sample_guid)
	if uid.version != 1:
		print( "We can only generate GUIDs v1. Aborting." )
		sys.exit(2)
	
	# Calculate the timestamp for the first GUID
	dt_base = datetime.datetime( 1582, 10, 15 ) 
	base_guid_time = estimated_ts - dt_base
	base_timestamp = int(base_guid_time.total_seconds() * NANO_INTERVAL)
	seconds = 2
	precision = get_precision(uid.time)
	start_time = int(base_timestamp - (NANO_INTERVAL) * seconds)
	end_time = int(base_timestamp + (NANO_INTERVAL) * seconds)

	for t in range( start_time, end_time, precision ):
		yield uuid1(uid.node, uid.clock_seq, t)

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("-d", "--dump", help="Dump decoded GUID and exit", action="store_true")
	parser.add_argument("-t", "--time",
                        help="The estimated time at which the GUID was generated. ie: '2021-02-27 17:42:01'",
                        type=lambda s: datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S"))
	parser.add_argument("guid", help="The GUID to inspect")
	args = parser.parse_args()

	# Validate GUID
	try:
		_ = uuid.UUID(args.guid)
	except:
		print("Invalid GUID. Aborting.")
		sys.exit(1)

	# Dump GUID and exit if that's what we want
	if args.dump:
		dump_guid(args.guid)
		sys.exit(0)

	if args.time is None:
		print( "Timestamp required. Use '-t' option. Aborting.")
		sys.exit(1)

	for u in gen_guids(args.guid, args.time):
		print(u)
	
if __name__ == "__main__":
	main()

# datetime.datetime.strptime('2024-08-14 17:21:16',"%Y-%m-%d %H:%M:%S")