import RPi.GPIO as GPIO
import time
import os
import sys
import urllib2

# Default is 4
PIR = 4

pirVal = False

GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR, GPIO.IN)

while True:
	pirVal = GPIO.input(PIR)

	if pirVal == True:
		urllib2.urlopen("http://192.168.178.43:1337/data/pir/1").read()
		print 1

	if pirVal == False:
		urllib2.urlopen("http://192.168.178.43:1337/data/pir/0").read()
		print 0

	time.sleep(2.5)
