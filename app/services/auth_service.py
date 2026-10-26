"""
Windows X-Ray - Local Authentication & Password Hashing Service
Provides secure offline user accounts without cloud dependency.
Uses PBKDF2-HMAC-SHA256 with unique cryptographic salt per user.
"""

import os
import hmac
import hashlib
import time
import re
from typing import Optional, Tuple
from app.services.database import DatabaseManager
from app.models import UserProfile

PBKDF2_ITERATIONS = 120_000
SALT_BYTES = 32
HASH_ALGORITHM = "sha256"


def validate_username(username: str) -> Tuple[bool, str]:
    """Validates username requirements."""
    if not username:
        return False, "Username cannot be empty."
    username = username.strip()
    if len(username) < 3 or len(username) > 32:
        return False, "Username must be between 3 and 32 characters."
    if not re.match(r"^[a-zA-Z0-9_\-\.]+$", username):
        return False, "Username can only contain alphanumeric characters, underscores, hyphens, and periods."
    return True, ""


def validate_password(password: str) -> Tuple[bool, str]:
    """Validates password strength requirements."""
    if not password:
        return False, "Password cannot be empty."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters."
    return True, ""


def hash_password(password: str, salt: Optional[bytes] = None) -> Tuple[str, str, int]:
    """
    Hashes a password with PBKDF2-HMAC-SHA256 and a random 32-byte salt.
    Returns (hex_hash, hex_salt, iterations).
    """
    if salt is None:
        salt = os.urandom(SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(
        HASH_ALGORITHM,
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return derived.hex(), salt.hex(), PBKDF2_ITERATIONS


def verify_password(password: str, stored_hash_hex: str, stored_salt_hex: str, iterations: int) -> bool:
    """Verifies a password against the stored hash using constant-time comparison."""
    try:
        salt = bytes.fromhex(stored_salt_hex)
        derived = hashlib.pbkdf2_hmac(
            HASH_ALGORITHM,
            password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(derived.hex(), stored_hash_hex)
    except Exception:
        return False


class LocalAuthService:
    """Local offline user authentication service."""

    def __init__(self, db: DatabaseManager):
        self.db = db
        self.current_user: Optional[UserProfile] = None

    def register_user(self, username: str, password: str) -> Tuple[bool, str, Optional[UserProfile]]:
        """Registers a new local account stored in SQLite."""
        username = username.strip()
        is_valid_user, err_u = validate_username(username)
        if not is_valid_user:
            return False, err_u, None

        is_valid_pass, err_p = validate_password(password)
        if not is_valid_pass:
            return False, err_p, None

        # Check existing
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE LOWER(username) = LOWER(?)", (username,))
            if cursor.fetchone() is not None:
                return False, f"User '{username}' already exists on this machine.", None

            pwd_hash, salt, iters = hash_password(password)
            now = time.time()
            cursor.execute("""
                INSERT INTO users (username, password_hash, salt, iterations, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (username, pwd_hash, salt, iters, now, now))
            conn.commit()
            user_id = cursor.lastrowid

            user = UserProfile(
                id=user_id,
                username=username,
                created_at=now,
                last_login=now,
                is_local=True,
            )
            self.current_user = user
            return True, "Account created successfully (stored locally on this PC).", user

    def login_user(self, username: str, password: str) -> Tuple[bool, str, Optional[UserProfile]]:
        """Authenticates a local user."""
        username = username.strip()
        if not username or not password:
            return False, "Please enter both username and password.", None

        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, password_hash, salt, iterations, created_at
                FROM users WHERE LOWER(username) = LOWER(?)
            """, (username,))
            row = cursor.fetchone()
            if not row:
                return False, "Invalid username or password.", None

            user_id, uname, stored_hash, salt, iters, created_at = (
                row["id"], row["username"], row["password_hash"], row["salt"], row["iterations"], row["created_at"]
            )

            if not verify_password(password, stored_hash, salt, iters):
                return False, "Invalid username or password.", None

            now = time.time()
            cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))
            conn.commit()

            user = UserProfile(
                id=user_id,
                username=uname,
                created_at=created_at,
                last_login=now,
                is_local=True,
            )
            self.current_user = user
            return True, f"Welcome back, {uname}!", user

    def logout(self):
        """Logs out current user session."""
        self.current_user = None

    def is_authenticated(self) -> bool:
        """Checks if a user is currently logged in."""
        return self.current_user is not None
