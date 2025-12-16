import random
import string

class PasswordGenerator:
    @staticmethod
    def generate(length: int = 16) -> str:
        """
        Generate a strong random password including uppercase, lowercase,
        digits, and special characters.
        """
        chars = string.ascii_letters + string.digits + "!@#$%^&*()-_=+[]{}<>?/|"
        
        # Ensure at least one uppercase, lowercase, digit, special
        groups = [
            random.choice(string.ascii_uppercase),
            random.choice(string.ascii_lowercase),
            random.choice(string.digits),
            random.choice("!@#$%^&*()-_=+[]{}<>?/|")
        ]
        
        remaining = ''.join(random.choice(chars) for _ in range(length - len(groups)))
        password = ''.join(random.sample(groups + list(remaining), length))
        return password

