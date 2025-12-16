import bcrypt

def hash_password(plain_password: str) -> bytes:
    """
    Hash a plain password using bcrypt.
    Returns a salted hash (bytes).
    """
    # Convert to bytes
    password_bytes = plain_password.encode('utf-8')
    # Generate salt
    salt = bcrypt.gensalt()
    # Hash the password
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed

def check_password(plain_password: str, hashed_password: bytes) -> bool:
    """
    Verify a plain password against the stored hash.
    """
    password_bytes = plain_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_password)
