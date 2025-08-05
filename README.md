# AI-Powered PR Selection and Merging System

A comprehensive GitHub Actions workflow system that automatically evaluates and selects the best pull request when multiple developers work on the same feature, then merges the winning PR and integrates superior code snippets from other PRs.

## 🚀 Quick Start

1. **Automatic Activation**: The system activates when multiple PRs target the same feature
2. **AI Evaluation**: All competing PRs are scored using comprehensive metrics
3. **Best Selection**: Highest-scoring PR wins and gets merged
4. **Code Integration**: Superior snippets from losing PRs are extracted for integration

## 📊 Evaluation Criteria

- **Code Quality (30%)**: Complexity, standards, maintainability
- **Testing & Coverage (25%)**: Test completeness and quality  
- **Performance (20%)**: Optimization and efficiency
- **Security (15%)**: Vulnerability scanning and best practices
- **Documentation (10%)**: Comments and documentation quality

## 🔧 Configuration

Customize the system by editing `config/evaluation-config.json`:

```json
{
  "scoring": {
    "weights": {
      "codeQuality": 0.30,
      "testing": 0.25,
      "performance": 0.20,
      "security": 0.15,
      "documentation": 0.10
    },
    "thresholds": {
      "minimumScore": 70,
      "autoMergeScore": 90
    }
  }
}
```

## 🎯 Features

### ✅ Automatic Feature Detection
- Branch pattern matching (`feature/*`, `feat/*`, etc.)
- PR title similarity analysis
- File overlap detection
- Label-based grouping

### ✅ Comprehensive Evaluation
- Multi-criteria scoring system
- Weighted evaluation metrics
- Quality threshold enforcement
- Detailed feedback reports

### ✅ Safe Merging Process
- Auto-merge for high-quality PRs
- Manual override capabilities
- Stakeholder notifications
- Audit trail maintenance

### ✅ Code Integration
- Superior snippet extraction
- Automated integration suggestions
- Proper author attribution
- Follow-up PR creation

## 📁 System Architecture

```
.github/workflows/
├── feature-detector.yml     # Detects competing PRs
├── ai-pr-evaluator.yml     # Evaluates and selects winner
├── code-analyzer.yml       # Real-time code quality analysis
└── snippet-integrator.yml  # Integrates superior snippets

scripts/
├── feature-detector.js     # Feature detection logic
├── pr-scorer.js           # PR scoring algorithm
├── code-analyzer.js       # Code analysis utilities
└── snippet-extractor.js   # Code snippet extraction

config/
└── evaluation-config.json # System configuration

docs/
└── ai-workflow-guide.md   # Comprehensive user guide
```

## 🚦 Workflow Process

1. **Detection Phase**: Feature detector identifies competing PRs
2. **Evaluation Phase**: AI system scores all competing PRs
3. **Selection Phase**: Highest-scoring PR is selected as winner
4. **Integration Phase**: Superior snippets are extracted and integrated
5. **Notification Phase**: All stakeholders are informed of results

## 🎓 For Developers

### Creating Competition-Eligible PRs

- Use standard branch naming: `feature/`, `feat/`, `enhancement/`
- Add clear, descriptive titles
- Include comprehensive tests
- Follow coding standards
- Add proper documentation

### Understanding Results

The system provides detailed feedback including:
- Overall score breakdown
- Individual metric scores
- Improvement recommendations
- Code snippet selections

## 📈 Benefits

- **Quality Assurance**: Automated quality evaluation ensures best code wins
- **Fair Competition**: Objective, multi-criteria evaluation process
- **Knowledge Sharing**: Superior snippets are preserved and integrated
- **Time Saving**: Automated evaluation and merging reduces manual overhead
- **Learning Opportunity**: Detailed feedback helps developers improve

## 🛡️ Security & Reliability

- Proper permission scoping
- Rate limiting for API calls
- Input validation and sanitization
- Audit trails for all decisions
- Manual override capabilities

## 📚 Documentation

See `docs/ai-workflow-guide.md` for complete documentation including:
- Detailed configuration options
- Troubleshooting guide
- Advanced customization
- API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

*Powered by AI • Built for developers • Designed for quality*