"""
Tests for auth module (auth.py, auth.py functions).
"""

import pytest
from src.services.password_service import hash_password, verify_password


class TestAuthPasswordFunctions:
    """Test authentication password functions."""

    def test_password_hashing_and_verification(self):
        """Test complete password hashing and verification flow."""
        original_password = "SecurePassword123!"

        # Hash the password
        hashed = hash_password(original_password)
        assert hashed is not None
        assert hashed != original_password

        # Verify with correct password
        assert verify_password(original_password, hashed) is True

        # Verify with incorrect password
        assert verify_password("WrongPassword", hashed) is False

    def test_password_hash_format(self):
        """Test that hashed password has correct format."""
        password = "TestPassword123!"
        hashed = hash_password(password)

        # Should be Argon2 format
        assert hashed.startswith("$argon2id$")
        assert len(hashed) > 20

    def test_password_verification_with_invalid_hash(self):
        """Test password verification with invalid hash."""
        password = "TestPassword"
        invalid_hash = "not_a_valid_hash"

        # Should return False for invalid hash
        result = verify_password(password, invalid_hash)
        assert result is False

    def test_multiple_password_hashes(self):
        """Test that same password produces different hashes (due to salt)."""
        password = "SamePassword123!"

        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # Hashes should be different due to random salt
        assert hash1 != hash2

        # But both should verify with the password
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True
