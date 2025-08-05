# AI-Powered Calculator Project

## Advanced Calculator Implementation

A comprehensive mathematical calculator implementation with advanced features and error handling.

### Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Advanced Operations**: Power, square root, factorial
- **Error Handling**: Comprehensive validation and error messages
- **Operation History**: Track all calculations performed
- **Logging**: Built-in logging for debugging and monitoring
- **Type Safety**: Strict type checking for all operations

### Usage

```python
from calculator import AdvancedCalculator

calc = AdvancedCalculator()

# Basic operations
result = calc.add(10, 5)        # 15
result = calc.divide(20, 4)     # 5.0

# Advanced operations
result = calc.power(2, 8)       # 256
result = calc.sqrt(64)          # 8.0
result = calc.factorial(5)      # 120

# View history
history = calc.get_history()
```

### Error Handling

The calculator includes comprehensive error handling for:
- Division by zero and near-zero values
- Invalid input types
- Negative square roots
- Factorial overflow protection
- Power operation overflow

### Testing

Run the calculator demo:
```bash
python calculator.py
```

This implementation provides a robust, production-ready calculator with extensive features and safety measures.

## GitHub Actions Workflow

This repository includes an AI-powered PR selection workflow that automatically evaluates competing pull requests and merges the best implementation based on:

- Code quality (30%)
- Git commit quality (25%) 
- PR description quality (20%)
- File analysis (15%)
- Timing factors (10%)

The workflow will automatically detect competing implementations and select the winner for auto-merge.