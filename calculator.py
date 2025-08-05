# Advanced Calculator Implementation - Feature Branch
import math
import logging

# Configure logging for better error tracking
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedCalculator:
    """Advanced calculator with comprehensive mathematical operations and error handling."""
    
    def __init__(self):
        """Initialize calculator with operation history."""
        self.history = []
        logger.info("Advanced Calculator initialized")
    
    def _log_operation(self, operation, operands, result):
        """Log operation to history."""
        entry = {
            'operation': operation,
            'operands': operands,
            'result': result
        }
        self.history.append(entry)
        logger.info(f"Operation logged: {operation}({operands}) = {result}")
    
    def add(self, a, b):
        """Add two numbers with advanced validation."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Operands must be numbers")
        result = a + b
        self._log_operation('add', [a, b], result)
        return result
    
    def subtract(self, a, b):
        """Subtract with advanced validation."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Operands must be numbers")
        result = a - b
        self._log_operation('subtract', [a, b], result)
        return result
    
    def multiply(self, a, b):
        """Multiply with advanced validation."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Operands must be numbers")
        result = a * b
        self._log_operation('multiply', [a, b], result)
        return result
    
    def divide(self, a, b):
        """Divide with comprehensive error handling."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Operands must be numbers")
        if b == 0:
            raise ValueError("Division by zero is undefined")
        if abs(b) < 1e-10:  # Near-zero handling
            raise ValueError("Division by near-zero value")
        result = a / b
        self._log_operation('divide', [a, b], result)
        return result
    
    def power(self, a, b):
        """Calculate power with overflow protection."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Operands must be numbers")
        try:
            result = math.pow(a, b)
            if math.isinf(result):
                raise OverflowError("Result too large")
            self._log_operation('power', [a, b], result)
            return result
        except OverflowError:
            raise OverflowError("Power operation resulted in overflow")
    
    def sqrt(self, a):
        """Calculate square root with validation."""
        if not isinstance(a, (int, float)):
            raise TypeError("Operand must be a number")
        if a < 0:
            raise ValueError("Cannot calculate square root of negative number")
        result = math.sqrt(a)
        self._log_operation('sqrt', [a], result)
        return result
    
    def factorial(self, n):
        """Calculate factorial with validation."""
        if not isinstance(n, int):
            raise TypeError("Factorial requires integer input")
        if n < 0:
            raise ValueError("Factorial undefined for negative numbers")
        if n > 100:  # Prevent excessive computation
            raise ValueError("Factorial too large (max 100)")
        result = math.factorial(n)
        self._log_operation('factorial', [n], result)
        return result
    
    def get_history(self):
        """Return operation history."""
        return self.history.copy()
    
    def clear_history(self):
        """Clear operation history."""
        self.history.clear()
        logger.info("History cleared")

if __name__ == "__main__":
    calc = AdvancedCalculator()
    print("Advanced Calculator - Comprehensive Implementation")
    print("Features: +, -, *, /, **, sqrt, factorial, history tracking")
    
    # Comprehensive demo
    try:
        print(f"Addition: 15 + 25 = {calc.add(15, 25)}")
        print(f"Subtraction: 50 - 20 = {calc.subtract(50, 20)}")
        print(f"Multiplication: 8 * 9 = {calc.multiply(8, 9)}")
        print(f"Division: 100 / 4 = {calc.divide(100, 4)}")
        print(f"Power: 3 ** 4 = {calc.power(3, 4)}")
        print(f"Square root: √64 = {calc.sqrt(64)}")
        print(f"Factorial: 5! = {calc.factorial(5)}")
        
        print(f"\nOperations performed: {len(calc.get_history())}")
        print("Advanced calculator implementation complete!")
        
    except Exception as e:
        logger.error(f"Error during demo: {e}")
        print(f"Demo error: {e}")
