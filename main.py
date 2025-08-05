def add(x, y):
    """Addition function with type checking and multiple argument support"""
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
        return [a + b for a, b in zip(x, y)]
    return x + y

def subtract(x, y):
    """Subtraction function with type checking"""
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
        return [a - b for a, b in zip(x, y)]
    return x - y

def multiply(x, y):
    """Multiplication function with support for different types"""
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
        return [a * b for a, b in zip(x, y)]
    return x * y

def divide(x, y):
    """Division function with zero division handling"""
    if y == 0 or (isinstance(y, (list, tuple)) and 0 in y):
        raise ValueError("Division by zero is not allowed")
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
        return [a / b for a, b in zip(x, y)]
    return x / y

def modulo(x, y):
    """Modulo function with zero division handling"""
    if y == 0 or (isinstance(y, (list, tuple)) and 0 in y):
        raise ValueError("Modulo by zero is not allowed")
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
        return [a % b for a, b in zip(x, y)]
    return x % y

def power(x, y):
    """Power function with overflow protection"""
    try:
        if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)):
            return [a ** b for a, b in zip(x, y)]
        return x ** y
    except OverflowError:
        raise ValueError("Result too large to compute")

def calculate(*args, operation):
    """Advanced calculator function that applies operation to multiple arguments"""
    if len(args) < 2:
        raise ValueError("At least two arguments required")
    
    operations = {
        'add': add,
        'subtract': subtract,
        'multiply': multiply,
        'divide': divide,
        'modulo': modulo,
        'power': power
    }
    
    if operation not in operations:
        raise ValueError(f"Unsupported operation: {operation}")
    
    result = args[0]
    for arg in args[1:]:
        result = operations[operation](result, arg)
    
    return result

# Example usage and testing
if __name__ == "__main__":
    # Basic operations
    print(f"Addition: {add(10, 5)}")
    print(f"Subtraction: {subtract(10, 5)}")
    print(f"Multiplication: {multiply(10, 5)}")
    print(f"Division: {divide(10, 5)}")
    print(f"Modulo: {modulo(10, 3)}")
    print(f"Power: {power(2, 3)}")
    
    # Advanced calculator
    print(f"Multiple addition: {calculate(1, 2, 3, 4, operation='add')}")
    print(f"List operations: {add([1, 2, 3], [4, 5, 6])}")