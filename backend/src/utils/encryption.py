"""Encryption utilities for secure API key storage."""
import os
import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def get_encryption_key() -> bytes:
    """Get or generate encryption key from environment.

    Uses SECRET_KEY from environment as base for encryption key derivation.

    Returns:
        32-byte encryption key
    """
    secret_key = os.getenv("SECRET_KEY", "default-secret-key-change-in-production")
    salt = os.getenv("ENCRYPTION_SALT", "evolution-todo-salt").encode()

    # Derive a secure key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
    return key


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key for secure storage.

    Args:
        api_key: Plain text API key

    Returns:
        Encrypted API key (base64 encoded)
    """
    if not api_key:
        return ""

    key = get_encryption_key()
    fernet = Fernet(key)
    encrypted = fernet.encrypt(api_key.encode())
    return base64.urlsafe_b64encode(encrypted).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an encrypted API key.

    Args:
        encrypted_key: Encrypted API key (base64 encoded)

    Returns:
        Decrypted plain text API key
    """
    if not encrypted_key:
        return ""

    try:
        key = get_encryption_key()
        fernet = Fernet(key)
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_key.encode())
        decrypted = fernet.decrypt(encrypted_bytes)
        return decrypted.decode()
    except Exception as e:
        print(f"[ENCRYPTION] Failed to decrypt API key: {e}")
        return ""


def mask_api_key(api_key: str) -> str:
    """Mask an API key for display (show first 4 and last 4 chars).

    Args:
        api_key: API key to mask

    Returns:
        Masked API key like "sk-a...xyz"
    """
    if not api_key or len(api_key) < 10:
        return "****"

    return f"{api_key[:6]}...{api_key[-4:]}"
