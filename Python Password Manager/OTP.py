import random

def generate_8_digit_otp():
    # Generate a random integer with 8 digits (10000000 to 99999999)
    pin = random.randint(10**7, 10**8 - 1)
    return str(pin)
