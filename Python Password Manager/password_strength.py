import re
from collections import Counter

# Small list of common weak passwords
COMMON_PASSWORDS = {
    "password","123456","12345678","qwerty","abc123","letmein","admin",
    "welcome","iloveyou","monkey","dragon","111111","123123","asdfghjkl",
    "helloworld","********","1234567890"
}

def _has_repeated_chars(s, repeat_threshold=4):
    """
    Detect long runs of the same character (e.g., 'aaaaa').
    Returns True if any character repeats consecutively >= repeat_threshold times.
    """
    cnt = 1
    prev = ""
    for ch in s:
        if ch == prev:
            cnt += 1
            if cnt >= repeat_threshold:
                return True
        else:
            cnt = 1
        prev = ch
    return False

def check_password_strength(password):
    """
    Evaluate password strength and return a dictionary:
      {
        'score': 0-100,
        'verdict': 'Very weak'|'Weak'|'Fair'|'Good'|'Strong'
      }
    Simplified: no detailed reasons or suggestions.
    """
    score = 0

    # Empty password check
    if not password:
        return {"score": 0, "verdict": "Very weak"}

    length = len(password)

    # 1) Length contribution (max 40 points)
    if length >= 16:
        score += 40
    elif length >= 12:
        score += 30
    elif length >= 8:
        score += 15
    else:
        score += 5  # Very short password

    # 2) Character variety (uppercase, lowercase, digits, symbols)
    lowers = bool(re.search(r'[a-z]', password))
    uppers = bool(re.search(r'[A-Z]', password))
    digits = bool(re.search(r'\d', password))
    symbols = bool(re.search(r'[^A-Za-z0-9]', password))
    variety = sum([lowers, uppers, digits, symbols])
    score += variety * 7  # Max 28 points

    # 3) Common password check (penalty)
    if password.lower() in COMMON_PASSWORDS:
        score -= 30

    # 4) Long alphabetic chunk penalty
    alpha_chunks = re.findall(r'[A-Za-z]{4,}', password)
    for chunk in alpha_chunks:
        if len(chunk) >= (length * 0.6):  # Alpha dominates
            score -= 10

    # 5) Repeated consecutive characters penalty
    if _has_repeated_chars(password):
        score -= 10

    # 6) Too many repeated characters overall (frequency penalty)
    counts = Counter(password)
    most_common_count = counts.most_common(1)[0][1]
    if most_common_count / length > 0.5:
        score -= 8

    # Bound the score to 0-100
    score = max(0, min(100, score))

    # Map score to verdict
    if score < 20:
        verdict = "Very weak"
    elif score < 40:
        verdict = "Weak"
    elif score < 60:
        verdict = "Fair"
    elif score < 80:
        verdict = "Good"
    else:
        verdict = "Strong"

    return {"score": score, "verdict": verdict}


# Example usage
if __name__ == "__main__":
    samples = [
        "password", "P@ssw0rd", "correcthorsebatterystaple",
        "Tr0ub4dor&3", "abcd1234", "S0m3$uperLongAnd$afePwd2025!" ,"a"
    ]
    for p in samples:
        result = check_password_strength(p)
        print(f"Password: {p!r}")
        print(f"  Score: {result['score']} / 100  Verdict: {result['verdict']}")
        print("-" * 60)
