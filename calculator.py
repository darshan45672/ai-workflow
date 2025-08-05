# Basic Calculator Implementation - Feature Branch
def add(a, b):
    """Add two numbers with basic implementation"""
    return a + b

def subtract(a, b):
    """Subtract two numbers with basic implementation"""  
    return a - b

def multiply(a, b):
    """Multiply two numbers with basic implementation"""
    return a * b

def divide(a, b):
    """Divide two numbers with basic error handling"""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def power(a, b):
    """Calculate power of a number - basic feature"""
    return a ** b

if __name__ == "__main__":
    print("Basic Calculator - Feature Implementation")
    print("Available operations: +, -, *, /, **")
    
    # Demo calculations
    print(f"Demo: 5 + 3 = {add(5, 3)}")
    print(f"Demo: 10 - 4 = {subtract(10, 4)}")
    print(f"Demo: 6 * 7 = {multiply(6, 7)}")
    print(f"Demo: 15 / 3 = {divide(15, 3)}")
    print(f"Demo: 2 ** 3 = {power(2, 3)}")
    print("Basic calculator implementation ready!")
