def add(a, b):
    """Add two numbers and return the result."""
    return a + b

def subtract(a, b):
    """Subtract b from a and return the result."""
    return a - b

def power(a, b):
    """Raise a to the power of b and return the result."""
    return a ** b

def modulo(a, b):
    """Return the remainder of a divided by b."""
    if b == 0:
        raise ValueError("Cannot perform modulo with zero")
    return a % b

# Example usage
if __name__ == "__main__":
    print(f"5 + 3 = {add(5, 3)}")
    print(f"5 - 3 = {subtract(5, 3)}")
    print(f"5 ** 3 = {power(5, 3)}")
    print(f"5 % 3 = {modulo(5, 3)}") #updated