import RPi.GPIO as GPIO
import time
import os
import sys

# Default is 4
PIR = 4

pirVal = False

GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR, GPIO.IN)

while True:
	pirVal = GPIO.input(PIR)

	if pirVal == True:
		print 1

	if pirVal == False:
		print 0

	time.sleep(1)
