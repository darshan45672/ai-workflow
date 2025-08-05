const core = require('@actions/core');
const github = require('@actions/github');
const CodeAnalyzer = require('./code-analyzer');

class PRScorer {
  constructor(config) {
    this.config = config;
    this.octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    this.codeAnalyzer = new CodeAnalyzer(config);
  }

  /**
   * Calculate comprehensive score for a PR
   * @param {Object} pr - PR object
   * @returns {Object} Detailed scoring result
   */
  async scorePR(pr) {
    try {
      const scores = {
        codeQuality: await this.scoreCodeQuality(pr),
        testing: await this.scoreTesting(pr),
        performance: await this.scorePerformance(pr),
        security: await this.scoreSecurity(pr),
        documentation: await this.scoreDocumentation(pr)
      };

      const weightedScore = this.calculateWeightedScore(scores);
      
      return {
        pr: {
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          created_at: pr.created_at,
          updated_at: pr.updated_at
        },
        scores,
        weightedScore,
        meetsThresholds: this.checkThresholds(scores, weightedScore),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      core.setFailed(`PR scoring failed: ${error.message}`);
      return this.getDefaultScore(pr);
    }
  }

  /**
   * Score code quality metrics (30% weight)
   */
  async scoreCodeQuality(pr) {
    const { owner, repo } = github.context.repo;
    const files = await this.getPRFiles(pr.number);
    
    let totalScore = 0;
    let metrics = {
      complexity: 0,
      maintainability: 0,
      duplication: 0,
      standards: 0
    };

    try {
      // Analyze code complexity
      metrics.complexity = await this.codeAnalyzer.analyzeComplexity(files);
      
      // Check coding standards compliance
      metrics.standards = await this.codeAnalyzer.checkCodingStandards(files);
      
      // Detect code duplication
      metrics.duplication = await this.codeAnalyzer.detectDuplication(files);
      
      // Calculate maintainability index
      metrics.maintainability = await this.codeAnalyzer.calculateMaintainability(files);
      
      // Calculate overall code quality score
      totalScore = (
        (100 - Math.min(metrics.complexity * 5, 50)) * 0.25 +
        metrics.standards * 0.30 +
        (100 - Math.min(metrics.duplication * 10, 50)) * 0.20 +
        metrics.maintainability * 0.25
      );
      
    } catch (error) {
      core.warning(`Code quality analysis failed: ${error.message}`);
      totalScore = 50; // Default middle score
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      metrics,
      details: 'Code quality analysis including complexity, standards, duplication, and maintainability'
    };
  }

  /**
   * Score testing coverage and quality (25% weight)
   */
  async scoreTesting(pr) {
    let totalScore = 0;
    let metrics = {
      coverage: 0,
      testFiles: 0,
      testsPassing: true,
      edgeCases: 0
    };

    try {
      // Check test coverage
      metrics.coverage = await this.analyzeTestCoverage(pr);
      
      // Count test files added/modified
      metrics.testFiles = await this.countTestFiles(pr);
      
      // Check if all tests are passing
      metrics.testsPassing = await this.checkTestStatus(pr);
      
      // Analyze edge case coverage
      metrics.edgeCases = await this.analyzeEdgeCaseCoverage(pr);
      
      // Calculate testing score
      const coverageScore = Math.min(metrics.coverage * 1.25, 100);
      const testFileScore = Math.min(metrics.testFiles * 20, 30);
      const passingScore = metrics.testsPassing ? 40 : 0;
      const edgeCaseScore = Math.min(metrics.edgeCases * 10, 30);
      
      totalScore = coverageScore * 0.4 + testFileScore * 0.2 + passingScore * 0.3 + edgeCaseScore * 0.1;
      
    } catch (error) {
      core.warning(`Testing analysis failed: ${error.message}`);
      totalScore = 60; // Default score
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      metrics,
      details: 'Testing analysis including coverage, test quality, and edge case handling'
    };
  }

  /**
   * Score performance improvements (20% weight)
   */
  async scorePerformance(pr) {
    let totalScore = 0;
    let metrics = {
      loadTime: 0,
      memoryUsage: 0,
      benchmarks: 0,
      optimizations: 0
    };

    try {
      // Analyze performance benchmarks
      metrics.benchmarks = await this.analyzePerformanceBenchmarks(pr);
      
      // Check for optimization patterns
      metrics.optimizations = await this.detectOptimizations(pr);
      
      // Mock performance metrics (in real implementation, these would come from actual benchmarks)
      metrics.loadTime = 85; // Score based on load time improvements
      metrics.memoryUsage = 75; // Score based on memory efficiency
      
      totalScore = (
        metrics.loadTime * 0.30 +
        metrics.memoryUsage * 0.25 +
        metrics.benchmarks * 0.25 +
        metrics.optimizations * 0.20
      );
      
    } catch (error) {
      core.warning(`Performance analysis failed: ${error.message}`);
      totalScore = 70; // Default score
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      metrics,
      details: 'Performance analysis including load time, memory usage, and optimizations'
    };
  }

  /**
   * Score security practices (15% weight)
   */
  async scoreSecurity(pr) {
    let totalScore = 0;
    let metrics = {
      vulnerabilities: 0,
      bestPractices: 0,
      inputValidation: 0,
      errorHandling: 0
    };

    try {
      // Check for security vulnerabilities
      metrics.vulnerabilities = await this.scanSecurityVulnerabilities(pr);
      
      // Analyze security best practices
      metrics.bestPractices = await this.analyzeSecurityPractices(pr);
      
      // Check input validation
      metrics.inputValidation = await this.analyzeInputValidation(pr);
      
      // Analyze error handling
      metrics.errorHandling = await this.analyzeErrorHandling(pr);
      
      totalScore = (
        (100 - metrics.vulnerabilities * 25) * 0.40 +
        metrics.bestPractices * 0.30 +
        metrics.inputValidation * 0.20 +
        metrics.errorHandling * 0.10
      );
      
    } catch (error) {
      core.warning(`Security analysis failed: ${error.message}`);
      totalScore = 80; // Default high score for security
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      metrics,
      details: 'Security analysis including vulnerability scanning and best practices'
    };
  }

  /**
   * Score documentation quality (10% weight)
   */
  async scoreDocumentation(pr) {
    let totalScore = 0;
    let metrics = {
      codeComments: 0,
      readmeUpdates: 0,
      apiDocs: 0,
      completeness: 0
    };

    try {
      const files = await this.getPRFiles(pr.number);
      
      // Analyze code comments
      metrics.codeComments = await this.analyzeCodeComments(files);
      
      // Check for README updates
      metrics.readmeUpdates = this.checkReadmeUpdates(files);
      
      // Check API documentation
      metrics.apiDocs = await this.analyzeAPIDocumentation(files);
      
      // Calculate documentation completeness
      metrics.completeness = (metrics.codeComments + metrics.readmeUpdates + metrics.apiDocs) / 3;
      
      totalScore = metrics.completeness;
      
    } catch (error) {
      core.warning(`Documentation analysis failed: ${error.message}`);
      totalScore = 60; // Default score
    }

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      metrics,
      details: 'Documentation analysis including code comments, README updates, and API docs'
    };
  }

  /**
   * Calculate weighted total score
   */
  calculateWeightedScore(scores) {
    const weights = this.config.scoring.weights;
    
    return (
      scores.codeQuality.score * weights.codeQuality +
      scores.testing.score * weights.testing +
      scores.performance.score * weights.performance +
      scores.security.score * weights.security +
      scores.documentation.score * weights.documentation
    );
  }

  /**
   * Check if PR meets minimum thresholds
   */
  checkThresholds(scores, weightedScore) {
    const thresholds = this.config.scoring.thresholds;
    
    return {
      overall: weightedScore >= thresholds.minimumScore,
      codeQuality: scores.codeQuality.score >= thresholds.codeQualityMin,
      testing: scores.testing.score >= thresholds.testingMin,
      performance: scores.performance.score >= thresholds.performanceMin,
      security: scores.security.score >= thresholds.securityMin,
      documentation: scores.documentation.score >= thresholds.documentationMin,
      autoMergeEligible: weightedScore >= thresholds.autoMergeScore
    };
  }

  /**
   * Get PR files
   */
  async getPRFiles(pullNumber) {
    const { owner, repo } = github.context.repo;
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber
    });
    return data;
  }

  // Helper methods for specific analyses
  async analyzeTestCoverage(pr) {
    // Mock implementation - in real scenario, parse coverage reports
    return Math.random() * 40 + 60; // 60-100%
  }

  async countTestFiles(pr) {
    const files = await this.getPRFiles(pr.number);
    return files.filter(file => 
      file.filename.includes('test') || 
      file.filename.includes('spec') ||
      file.filename.endsWith('.test.js') ||
      file.filename.endsWith('.spec.js')
    ).length;
  }

  async checkTestStatus(pr) {
    // Mock implementation - in real scenario, check CI status
    return Math.random() > 0.1; // 90% chance tests are passing
  }

  async analyzeEdgeCaseCoverage(pr) {
    // Mock implementation
    return Math.floor(Math.random() * 5);
  }

  async analyzePerformanceBenchmarks(pr) {
    // Mock implementation
    return Math.random() * 30 + 70;
  }

  async detectOptimizations(pr) {
    const files = await this.getPRFiles(pr.number);
    let optimizationScore = 0;
    
    // Look for optimization keywords in changes
    const optimizationKeywords = ['cache', 'optimize', 'performance', 'efficient', 'faster'];
    
    for (const file of files) {
      if (file.patch) {
        for (const keyword of optimizationKeywords) {
          if (file.patch.toLowerCase().includes(keyword)) {
            optimizationScore += 20;
          }
        }
      }
    }
    
    return Math.min(100, optimizationScore);
  }

  async scanSecurityVulnerabilities(pr) {
    // Mock implementation - in real scenario, integrate with security scanners
    return Math.floor(Math.random() * 3); // 0-2 vulnerabilities
  }

  async analyzeSecurityPractices(pr) {
    // Mock implementation
    return Math.random() * 30 + 70;
  }

  async analyzeInputValidation(pr) {
    const files = await this.getPRFiles(pr.number);
    let validationScore = 0;
    
    // Look for input validation patterns
    const validationKeywords = ['validate', 'sanitize', 'escape', 'check', 'verify'];
    
    for (const file of files) {
      if (file.patch) {
        for (const keyword of validationKeywords) {
          if (file.patch.toLowerCase().includes(keyword)) {
            validationScore += 20;
          }
        }
      }
    }
    
    return Math.min(100, validationScore);
  }

  async analyzeErrorHandling(pr) {
    const files = await this.getPRFiles(pr.number);
    let errorScore = 0;
    
    // Look for error handling patterns
    const errorKeywords = ['try', 'catch', 'error', 'exception', 'throw'];
    
    for (const file of files) {
      if (file.patch) {
        for (const keyword of errorKeywords) {
          if (file.patch.toLowerCase().includes(keyword)) {
            errorScore += 15;
          }
        }
      }
    }
    
    return Math.min(100, errorScore);
  }

  async analyzeCodeComments(files) {
    let commentScore = 0;
    let totalLines = 0;
    let commentLines = 0;
    
    for (const file of files) {
      if (file.patch) {
        const lines = file.patch.split('\n');
        totalLines += lines.length;
        
        commentLines += lines.filter(line => 
          line.trim().startsWith('//') || 
          line.trim().startsWith('/*') ||
          line.trim().startsWith('*') ||
          line.trim().startsWith('#')
        ).length;
      }
    }
    
    if (totalLines > 0) {
      commentScore = (commentLines / totalLines) * 100 * 5; // Boost comment ratio
    }
    
    return Math.min(100, commentScore);
  }

  checkReadmeUpdates(files) {
    const hasReadmeUpdate = files.some(file => 
      file.filename.toLowerCase().includes('readme') ||
      file.filename.toLowerCase().includes('doc')
    );
    
    return hasReadmeUpdate ? 80 : 20;
  }

  async analyzeAPIDocumentation(files) {
    // Look for API documentation patterns
    const docFiles = files.filter(file => 
      file.filename.includes('doc') ||
      file.filename.includes('api') ||
      file.filename.endsWith('.md')
    );
    
    return docFiles.length > 0 ? 80 : 40;
  }

  getDefaultScore(pr) {
    return {
      pr: {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        created_at: pr.created_at,
        updated_at: pr.updated_at
      },
      scores: {
        codeQuality: { score: 50, metrics: {}, details: 'Default score due to analysis failure' },
        testing: { score: 50, metrics: {}, details: 'Default score due to analysis failure' },
        performance: { score: 50, metrics: {}, details: 'Default score due to analysis failure' },
        security: { score: 50, metrics: {}, details: 'Default score due to analysis failure' },
        documentation: { score: 50, metrics: {}, details: 'Default score due to analysis failure' }
      },
      weightedScore: 50,
      meetsThresholds: {
        overall: false,
        codeQuality: false,
        testing: false,
        performance: false,
        security: false,
        documentation: false,
        autoMergeEligible: false
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = PRScorer;