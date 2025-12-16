" AES.py "

What Is AES (Advance Encryption Standard) ??
:- AES (Advanced Encryption Standard) is a widely used encryption algorithm designed to securely protect data by converting it into an unreadable format unless the correct key is provided.

How AES Works:

The plaintext is divided into 128-bit blocks.
Each block is encrypted using a series of mathematical operations (substitution, permutation, mixing, and key addition) over multiple rounds.
The result is ciphertext, which appears random and cannot be decrypted without the correct key.

Libraries Used ............

PBKDF2HMAC: Derives a strong cryptographic key from a password.
hashes: Uses SHA-256 for key derivation.
padding: Applies PKCS7 padding to ensure data fits AES block size.
Cipher, algorithms, modes: For AES encryption in CBC mode.
os: Generates random salt and IV.
base64: Encodes binary data (ciphertext) into a string for storage.

1. def derived_key()

Converts a password into a 256-bit encryption key.
Uses PBKDF2 with SHA-256, 100,000 iterations, and a random salt.
The salt ensures the same password produces different keys each time (prevents rainbow table attacks).
Output: 32-byte key for AES-256.

RAINBOW TABLE ATTACKS: A rainbow table attack is a method used by attackers to crack password hashes by using a precomputed table of hash values and their corresponding plaintext passwords.

How it works:

Passwords are usually stored as hashes, not plaintext.
Attackers create a large table (rainbow table) of common passwords and their hash values.
When attackers get access to hashed passwords (e.g., from a data breach), they look up these hashes in the rainbow table.
If a match is found, they know the original password without needing to brute-force it.
This attack is much faster than brute-force because the heavy computation is done beforehand.

Why it’s dangerous:
If passwords are hashed without a salt (random data added before hashing), rainbow tables can quickly reverse the hashes.
Salting passwords makes rainbow tables ineffective because each password hash becomes unique.

2. def encrypt(plaintext: str, master_password: str) -> str:

Generate random salt and IV (Initialization Vector).
Derive key from master_password using derive_key().
Pad the plaintext so it fits AES block size (16 bytes).
Encrypt using AES-256 in CBC mode.
Combine IV + ciphertext + salt and encode as base64 string for safe storage/transmission.

What is IV (Initialization Vector) ??

An Initialization Vector (IV) is a random or pseudorandom value used in cryptography to ensure that the same plaintext encrypted multiple times with the same key produces different ciphertexts.

iv = os.urandom(16) creates a secure, random 16-byte value to use as the initialization vector for AES encryption, ensuring each encryption operation is unique and secure.

It is included at the start of the encrypted data, so when you want to decrypt, you can extract the IV from the first 16 bytes of the decoded data.

3. def decrypt(b64_encoded_ciphertext: str, master_password: str) -> str:

Decode base64 string back to bytes.
Extract IV (first 16 bytes), salt (last 16 bytes), and ciphertext (middle).
Derive the same key using the provided master_password and extracted salt.
Decrypt using AES-CBC.
Remove PKCS7 padding and return the original plaintext.

What is Salt ?
A salt in cryptography is a random value that is added to data (like a password) before it is hashed or used in key derivation. Its main purpose is to make each hash or derived key unique, even if the original data (like the password) is the same.

How It Works ?

A new, random salt is generated for each password or encryption operation.
The salt is combined with the password (or plaintext) before hashing or key derivation.
The salt is stored alongside the hash or ciphertext (it does not need to be secret).

" hash_with_bcrypt.py "

What is Bcrypt ???

:-Bcrypt is a password-hashing algorithm designed to securely store passwords by converting them into a unique, unreadable hash. It is widely used in web applications and security systems.

- It is one way hashing that cannot be reversed back to original password.

How Bcrypt Works:

A random salt is generated.
The password and salt are combined and hashed using multiple rounds.
The output is a string that includes the algorithm identifier, cost factor, salt, and hash.

for eg: $2b$12$abcdefghijABCDEFGHIjklmnop12345612345abcde1234567890uvwxyz

                $2b$ = bcrypt identifier
                12 = cost factor (number of rounds)
                Next 22 characters = salt
                Remaining = hashed password

BRUTE FORCE ATTACK :- A brute force attack is a hacking technique where an attacker tries every possible combination of passwords, encryption keys, or login credentials until the correct one is found.

Diffreence Between Bcrypt and AES ?

1. Purpose
   AES: Designed for encrypting and decrypting any kind of data, protecting its confidentiality whether stored or transmitted.

bcrypt: Specifically designed for password hashing and secure verification during authentication—never for general data encryption.

2. Type
   AES: Symmetric block cipher (an encryption algorithm).

bcrypt: Adaptive, salted, one-way password hashing function.

3. Key Usage
   AES: Requires a secret encryption key for both encryption and decryption; anyone with the key can unlock the data.

bcrypt: No key is used for decryption. Instead, bcrypt produces a hash and password authentication works by comparing the user-entered password (hashed with the original salt and cost factor) to the stored hash.

4. Algorithm Base
   AES: Works with block sizes of 128 bits and key sizes of 128, 192, or 256 bits.

bcrypt: Built on the Blowfish cipher, but specifically for password hashing, and includes salt and an adjustable cost factor.

5. Output
   AES: Produces ciphertext, which can be decrypted back to the original data if you know the key.

bcrypt: Produces a hash (one-way output) from a password; you cannot reverse a hash to get the original password.

6. Salt and IV
   AES: Uses an Initialization Vector (IV) for extra randomness in block cipher modes, not a salt.

bcrypt: Adds a unique random salt for each password before hashing, so identical passwords always produce different hashes.

7. Reversibility
   AES: Reversible—data can be decrypted to plaintext with the secret key.

bcrypt: Irreversible—hashes cannot be turned back into the original password.

8. Use Case
   AES: Encrypting files, network data, databases, cloud backups—any scenario where data must be hidden but later recovered.

bcrypt: Storing and validating passwords securely for login systems—defensive against attackers stealing password databases.

9. Security Strengthening
   AES: Depends on keeping the key secret and using strong, random IVs.

bcrypt: Has an adjustable computational cost ("work factor") that slows down hashing to resist brute-force and dictionary attacks. This cost can be increased over time.

10. Vulnerabilities
    AES: Poor key management, weak or reused IVs, and implementation errors can expose data.

bcrypt: If cost factor isn't updated, newer hardware can brute-force efficiently, but proper configuration keeps it safe.

11. Performance

AES: Extremely fast (especially with hardware support like AES-NI).

bcrypt: Intentionally slow, making it much harder to brute-force passwords (and easier to defend against attacks).

---

What is JSON file?
:- A JSON file is a plain text file that stores data in the JSON (JavaScript Object Notation) format. This format is widely used for data exchange between software systems, APIs, and configuration files because it is easy for both humans and machines to read and write.

Key Features of a JSON File
Structure: Data is organized using key-value pairs and arrays, similar to objects in JavaScript.

Syntax: Uses curly braces {} for objects and square brackets [] for arrays. Every key is a string in double quotes, followed by a colon and a value.

Data Types Supported: Strings, numbers, booleans, null, arrays, and nested objects.

Extension: Files typically end with .json (for example, data.json)

HAZMAT : In Python, hazmat stands for the “hazardous materials” layer of the cryptography library. It provides low-level cryptographic primitives and algorithms that allow developers to build customized encryption systems. However, it is called “hazmat” because misuse of these primitives can lead to serious security vulnerabilities, and therefore it is intended only for experts who know what they’re doing.
