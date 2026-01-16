#!/usr/bin/env python3
"""Test runner script for Evolution of Todo backend."""
import sys
import subprocess
from pathlib import Path


def run_tests(args=None):
    """Run pytest with optional arguments."""
    backend_dir = Path(__file__).parent

    # Build pytest command
    cmd = ["pytest"]

    if args:
        cmd.extend(args)
    else:
        # Default: run all tests with coverage
        cmd.extend([
            "-v",
            "--cov=src",
            "--cov-report=term-missing",
            "--cov-report=html",
        ])

    print(f"Running: {' '.join(cmd)}")
    print("-" * 70)

    # Run pytest
    result = subprocess.run(cmd, cwd=backend_dir)

    return result.returncode


def main():
    """Main entry point."""
    # Get command line arguments (excluding script name)
    args = sys.argv[1:]

    # Show help if requested
    if "-h" in args or "--help" in args:
        print("Evolution of Todo - Test Runner\n")
        print("Usage:")
        print("  python run_tests.py              # Run all tests with coverage")
        print("  python run_tests.py unit         # Run unit tests only")
        print("  python run_tests.py integration  # Run integration tests only")
        print("  python run_tests.py -k pattern   # Run tests matching pattern")
        print("  python run_tests.py --lf         # Run last failed tests")
        print("  python run_tests.py -x           # Stop on first failure")
        print("\nExamples:")
        print("  python run_tests.py tests/unit/test_repository.py")
        print("  python run_tests.py -k test_create_task")
        print("  python run_tests.py --cov-report=html")
        return 0

    # Handle shortcuts
    if len(args) == 1:
        if args[0] == "unit":
            args = ["tests/unit/", "-v"]
        elif args[0] == "integration":
            args = ["tests/integration/", "-v"]
        elif args[0] == "coverage":
            args = ["--cov=src", "--cov-report=html", "--cov-report=term"]
        elif args[0] == "fast":
            # Fast mode: no coverage
            args = ["-v", "-x"]

    # Run tests
    return run_tests(args)


if __name__ == "__main__":
    sys.exit(main())
