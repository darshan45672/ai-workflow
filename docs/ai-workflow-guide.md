# AI-Powered PR Selection and Merging System User Guide

## Overview

This AI-powered workflow system automatically evaluates and selects the best pull request when multiple developers work on the same feature, then merges the winning PR and integrates superior code snippets from other PRs.

## 🚀 Key Features

### Automatic Feature Detection
- Detects when multiple PRs target the same feature
- Uses branch naming patterns, labels, title similarity, and file overlap analysis
- Triggers competitive evaluation automatically

### Comprehensive AI Evaluation
- **Code Quality (30%)**: Complexity, standards compliance, maintainability
- **Testing & Coverage (25%)**: Test completeness, coverage percentage, quality
- **Performance (20%)**: Optimization patterns, efficiency improvements
- **Security (15%)**: Vulnerability scanning, best practices compliance
- **Documentation (10%)**: Code comments, documentation completeness

### Intelligent Code Integration
- Identifies superior code snippets from losing PRs
- Creates integration suggestions with proper attribution
- Generates follow-up PRs for code improvements

## 🔧 System Components

### 1. Feature Detection Workflow (`.github/workflows/feature-detector.yml`)
**Triggers:** PR opened, synchronized, or reopened
**Purpose:** Detect competing PRs for the same feature

**Process:**
1. Analyzes PR branch names, labels, and titles
2. Compares file changes for overlap
3. Groups related PRs by feature
4. Triggers evaluation if competition detected

### 2. AI PR Evaluator (`.github/workflows/ai-pr-evaluator.yml`)
**Triggers:** Manual dispatch from feature detector
**Purpose:** Comprehensive evaluation and selection

**Process:**
1. Scores all competing PRs using weighted criteria
2. Selects highest-scoring PR as winner
3. Auto-merges if quality thresholds met
4. Closes losing PRs with detailed feedback
5. Triggers snippet integration if applicable

### 3. Code Analyzer (`.github/workflows/code-analyzer.yml`)
**Triggers:** PR opened/updated with code changes
**Purpose:** Real-time code quality analysis

**Process:**
1. Analyzes code complexity and maintainability
2. Checks coding standards compliance
3. Detects code duplication
4. Generates quality scores and recommendations

### 4. Snippet Integrator (`.github/workflows/snippet-integrator.yml`)
**Triggers:** Manual dispatch from evaluator
**Purpose:** Extract and integrate superior code

**Process:**
1. Identifies high-quality snippets from losing PRs
2. Creates integration suggestions with attribution
3. Generates follow-up PR with improvements
4. Notifies original authors of snippet selection

## ⚙️ Configuration

### Evaluation Configuration (`config/evaluation-config.json`)

```json
{
  "scoring": {
    "weights": {
      "codeQuality": 0.30,    // 30% weight for code quality
      "testing": 0.25,        // 25% weight for testing
      "performance": 0.20,    // 20% weight for performance
      "security": 0.15,       // 15% weight for security
      "documentation": 0.10   // 10% weight for documentation
    },
    "thresholds": {
      "minimumScore": 70,     // Minimum score to pass evaluation
      "autoMergeScore": 90,   // Score required for auto-merge
      "codeQualityMin": 60,   // Minimum code quality score
      "testingMin": 70,       // Minimum testing score
      "performanceMin": 50,   // Minimum performance score
      "securityMin": 80,      // Minimum security score
      "documentationMin": 40  // Minimum documentation score
    }
  },
  "featureDetection": {
    "branchPatterns": [
      "feature/*",
      "feat/*",
      "enhancement/*",
      "improvement/*"
    ],
    "titleSimilarityThreshold": 0.7,
    "fileOverlapThreshold": 0.3
  }
}
```

### Customization Options

1. **Scoring Weights**: Adjust importance of different criteria
2. **Quality Thresholds**: Set minimum scores for approval
3. **Feature Detection**: Configure branch patterns and similarity thresholds
4. **Auto-merge Settings**: Control automatic merging behavior

## 📋 Usage Guide

### For Developers

#### Creating Competition-Eligible PRs

1. **Use Standard Branch Naming**:
   ```
   feature/authentication-system
   feat/user-login-flow
   enhancement/password-security
   ```

2. **Add Descriptive Labels**:
   - `feature`, `enhancement`, `new-feature`, `improvement`

3. **Write Clear Titles**:
   - Similar titles will trigger competition detection
   - Example: "Implement user authentication system"

4. **Follow Best Practices**:
   - Write comprehensive tests
   - Add proper documentation
   - Follow coding standards
   - Include error handling

#### During Competition

1. **Monitor AI Comments**: The system will comment on your PR when competition is detected
2. **Check Evaluation Results**: Detailed scoring breakdown will be provided
3. **Learn from Feedback**: Use scoring details to improve future PRs
4. **Contribute to Integration**: Your code snippets may be selected for integration

### For Maintainers

#### Manual Override Process

If you need to override AI decisions:

1. **Comment Override**: Add a comment with `@ai-workflow override` to bypass automatic closure
2. **Manual Merge**: Merge manually if needed, system will detect and skip auto-actions
3. **Config Adjustment**: Modify thresholds in `config/evaluation-config.json`

#### Monitoring and Control

1. **Check Workflow Runs**: Monitor AI decisions in Actions tab
2. **Review Integration PRs**: Manually review suggested code integrations
3. **Adjust Configuration**: Fine-tune weights and thresholds based on results

## 🔍 Understanding AI Evaluation

### Code Quality Metrics (30% weight)

- **Complexity Analysis**: Cyclomatic complexity of added code
- **Coding Standards**: Adherence to naming conventions, formatting
- **Code Duplication**: Detection of repeated code patterns
- **Maintainability**: Overall code maintainability index

**Scoring Example**:
```
Complexity Score: 85/100 (Low complexity, well-structured)
Standards Score: 92/100 (Excellent naming, proper formatting)
Duplication Score: 78/100 (Minimal duplication detected)
Maintainability: 88/100 (Highly maintainable code)
Final Code Quality: 86/100
```

### Testing & Coverage (25% weight)

- **Test Coverage**: Percentage of code covered by tests
- **Test Quality**: Comprehensiveness and assertion quality
- **Test Types**: Unit, integration, edge case coverage
- **Passing Status**: All tests must pass

### Performance Analysis (20% weight)

- **Optimization Patterns**: Detection of performance improvements
- **Resource Efficiency**: Memory and CPU usage considerations
- **Benchmark Results**: Performance test outcomes
- **Load Time Impact**: Effect on application performance

### Security Assessment (15% weight)

- **Vulnerability Scanning**: Detection of security issues
- **Input Validation**: Proper sanitization and validation
- **Error Handling**: Secure error management
- **Best Practices**: Security coding standards compliance

### Documentation Quality (10% weight)

- **Code Comments**: Inline documentation quality
- **README Updates**: Documentation completeness
- **API Documentation**: Function and class documentation
- **Change Documentation**: Description of modifications

## 📊 Evaluation Report Structure

### Sample Evaluation Output

```json
{
  "featureGroup": "User Authentication System",
  "winner": {
    "pr": {
      "number": 123,
      "title": "Implement secure user authentication",
      "author": "developer1"
    },
    "weightedScore": 87.5,
    "scores": {
      "codeQuality": { "score": 86, "metrics": {...} },
      "testing": { "score": 91, "metrics": {...} },
      "performance": { "score": 84, "metrics": {...} },
      "security": { "score": 95, "metrics": {...} },
      "documentation": { "score": 78, "metrics": {...} }
    }
  },
  "superiorSnippets": [
    {
      "type": "function",
      "filename": "auth.js",
      "quality": { "score": 92 },
      "pr": { "number": 124, "author": "developer2" },
      "reasoning": "Superior error handling implementation"
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

#### Competition Not Detected

**Symptoms**: Multiple similar PRs don't trigger evaluation
**Solutions**:
1. Check branch naming patterns in config
2. Verify PR titles have sufficient similarity (>70% by default)
3. Ensure file overlap threshold is met (>30% by default)

#### Low Evaluation Scores

**Symptoms**: All PRs score below thresholds
**Solutions**:
1. Review code quality guidelines
2. Add comprehensive tests
3. Improve documentation
4. Address security concerns
5. Consider adjusting thresholds in config

#### Auto-merge Failures

**Symptoms**: High-scoring PRs don't auto-merge
**Solutions**:
1. Check branch protection rules
2. Verify all required status checks pass
3. Ensure PR is mergeable (no conflicts)
4. Review auto-merge threshold settings

#### Integration PR Issues

**Symptoms**: Snippet integration fails or creates poor suggestions
**Solutions**:
1. Review integration complexity thresholds
2. Manually review suggested snippets
3. Adjust quality score thresholds for snippet selection
4. Check for merge conflicts in suggestions

### Error Recovery

1. **Workflow Failures**: Check Actions tab for detailed error logs
2. **Config Errors**: Validate JSON syntax in configuration files
3. **Permission Issues**: Ensure GITHUB_TOKEN has required permissions
4. **API Limits**: Monitor rate limiting in workflow logs

## 🔧 Advanced Configuration

### Custom Quality Checks

Add custom analysis rules by modifying the code analyzer:

```javascript
// scripts/code-analyzer.js
customQualityCheck(code) {
  // Add your custom logic here
  let score = 100;
  
  // Example: Check for specific patterns
  if (!code.includes('errorHandler')) {
    score -= 20;
  }
  
  return score;
}
```

### Integration Filters

Customize snippet selection criteria:

```javascript
// scripts/snippet-extractor.js
shouldIntegrateSnippet(snippet) {
  // Custom integration logic
  return snippet.quality.score > 85 && 
         snippet.integrationComplexity === 'low' &&
         snippet.type === 'function';
}
```

### Notification Customization

Modify notification messages in workflow files:

```yaml
# .github/workflows/ai-pr-evaluator.yml
- name: Custom notification
  run: |
    echo "Custom message: PR evaluation complete"
    # Add your notification logic
```

## 📈 Metrics and Analytics

### Tracking System Performance

The system generates several metrics for monitoring:

1. **Evaluation Accuracy**: Manual override frequency
2. **Integration Success**: Percentage of suggestions implemented
3. **Developer Satisfaction**: Feedback from PR comments
4. **Code Quality Trends**: Score improvements over time

### Performance Optimization

1. **Threshold Tuning**: Adjust based on historical data
2. **Weight Optimization**: Fine-tune criteria importance
3. **Pattern Recognition**: Improve feature detection accuracy

## 🤝 Contributing

### Extending the System

1. **Add New Metrics**: Extend evaluation criteria
2. **Improve Detection**: Enhance feature grouping logic
3. **Better Integration**: Improve code snippet merging
4. **Custom Workflows**: Add domain-specific evaluations

### Testing Changes

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test workflow interactions
3. **Mock Scenarios**: Test with sample PRs
4. **Performance Tests**: Verify scalability

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Octokit REST API](https://octokit.github.io/rest.js/)
- [Code Quality Best Practices](https://github.com/collections/clean-code-linters)
- [Security Scanning Tools](https://github.com/analysis-tools-dev/static-analysis)

## 📄 License

This AI workflow system is provided under the MIT License. See LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions:

1. **GitHub Issues**: Report bugs and feature requests
2. **Discussions**: Ask questions and share feedback
3. **Wiki**: Detailed technical documentation
4. **Contributing Guide**: Guidelines for contributions

---

*This documentation is maintained by the AI Workflow System. Last updated: $(date)*