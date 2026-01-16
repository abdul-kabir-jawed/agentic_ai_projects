"""
Tests for password service.
"""

import pytest
from src.services.password_service import hash_password, verify_password


class TestHashPassword:
    """Test hash_password function."""

    def test_hash_password_success(self):
        """Test hashing a password."""
        password = "MySecurePassword123!"
        hashed = hash_password(password)

        # Should return a non-empty string
        assert hashed
        assert isinstance(hashed, str)
        # Should not be the same as original
        assert hashed != password

    def test_hash_password_with_salt(self):
        """Test that Argon2 hashes include salt (random each time)."""
        password = "MySecurePassword123!"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # Argon2 includes random salt, so hashes are different each time
        assert hash1 != hash2
        # But both should be valid Argon2 hashes
        assert "$argon2id$" in hash1
        assert "$argon2id$" in hash2


class TestVerifyPassword:
    """Test verify_password function."""

    def test_verify_password_success(self):
        """Test verifying correct password."""
        password = "MySecurePassword123!"
        hashed = hash_password(password)

        result = verify_password(password, hashed)
        assert result is True

    def test_verify_password_failure(self):
        """Test verifying incorrect password."""
        password = "MySecurePassword123!"
        hashed = hash_password(password)

        result = verify_password("WrongPassword", hashed)
        assert result is False

    def test_verify_password_case_sensitive(self):
        """Test that password verification is case sensitive."""
        password = "MySecurePassword123!"
        hashed = hash_password(password)

        result = verify_password("mysecurepassword123!", hashed)
        assert result is False
