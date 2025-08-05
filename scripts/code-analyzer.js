const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
  constructor(config) {
    this.config = config;
  }

  /**
   * Analyze code complexity
   * @param {Array} files - Array of file objects from PR
   * @returns {number} Complexity score (0-20, lower is better)
   */
  async analyzeComplexity(files) {
    let totalComplexity = 0;
    let fileCount = 0;

    for (const file of files) {
      if (this.isCodeFile(file.filename) && file.patch) {
        const complexity = this.calculateCyclomaticComplexity(file.patch);
        totalComplexity += complexity;
        fileCount++;
      }
    }

    return fileCount > 0 ? totalComplexity / fileCount : 0;
  }

  /**
   * Calculate cyclomatic complexity for code patch
   */
  calculateCyclomaticComplexity(patch) {
    // Simple complexity analysis based on control flow keywords
    const complexityKeywords = [
      'if', 'else', 'elif', 'elsif', 'switch', 'case', 'default',
      'for', 'while', 'do', 'foreach', 'loop',
      'try', 'catch', 'except', 'finally',
      'and', 'or', '&&', '||', '?', ':',
      'break', 'continue', 'return', 'throw', 'raise'
    ];

    let complexity = 1; // Base complexity
    const lines = patch.split('\n');

    for (const line of lines) {
      if (line.startsWith('+')) { // Only analyze added lines
        const cleanLine = line.substring(1).trim().toLowerCase();
        
        for (const keyword of complexityKeywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          const matches = cleanLine.match(regex);
          if (matches) {
            complexity += matches.length;
          }
        }
      }
    }

    return complexity;
  }

  /**
   * Check coding standards compliance
   * @param {Array} files - Array of file objects from PR
   * @returns {number} Standards compliance score (0-100)
   */
  async checkCodingStandards(files) {
    let totalScore = 0;
    let fileCount = 0;

    for (const file of files) {
      if (this.isCodeFile(file.filename) && file.patch) {
        const score = this.analyzeCodingStandards(file);
        totalScore += score;
        fileCount++;
      }
    }

    return fileCount > 0 ? totalScore / fileCount : 100;
  }

  /**
   * Analyze coding standards for a single file
   */
  analyzeCodingStandards(file) {
    let score = 100;
    const lines = file.patch.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).map(line => line.substring(1));

    // Check various coding standards
    score -= this.checkNamingConventions(addedLines, file.filename) * 5;
    score -= this.checkIndentation(addedLines) * 3;
    score -= this.checkLineLength(addedLines) * 2;
    score -= this.checkCodeStructure(addedLines) * 4;

    return Math.max(0, score);
  }

  /**
   * Check naming conventions
   */
  checkNamingConventions(lines, filename) {
    let violations = 0;
    const fileType = this.getFileType(filename);

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for bad naming patterns
      if (fileType === 'javascript' || fileType === 'typescript') {
        // Check camelCase for variables/functions
        const variablePattern = /(?:var|let|const|function)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = variablePattern.exec(trimmed)) !== null) {
          const name = match[1];
          if (name.includes('_') && !name.toUpperCase() === name) {
            violations++;
          }
        }
      }
      
      // Check for single character variables (except i, j, k in loops)
      if (/\b[a-z]\s*[=:]/g.test(trimmed) && !/(for|while).*[ijk]\s*[=<>]/g.test(trimmed)) {
        violations++;
      }
    }

    return Math.min(violations, 10);
  }

  /**
   * Check indentation consistency
   */
  checkIndentation(lines) {
    let violations = 0;
    let expectedIndent = null;

    for (const line of lines) {
      if (line.trim().length === 0) continue;

      const spaces = line.match(/^(\s*)/)[1].length;
      
      if (spaces > 0) {
        if (expectedIndent === null) {
          expectedIndent = spaces;
        } else if (spaces % expectedIndent !== 0) {
          violations++;
        }
      }
    }

    return Math.min(violations, 20);
  }

  /**
   * Check line length
   */
  checkLineLength(lines) {
    let violations = 0;
    const maxLength = 120;

    for (const line of lines) {
      if (line.length > maxLength) {
        violations++;
      }
    }

    return Math.min(violations, 10);
  }

  /**
   * Check code structure patterns
   */
  checkCodeStructure(lines) {
    let violations = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for nested ternary operators
      if ((trimmed.match(/\?/g) || []).length > 1) {
        violations++;
      }
      
      // Check for deeply nested conditions
      if (trimmed.includes('if') && (trimmed.match(/if/g) || []).length > 2) {
        violations++;
      }
      
      // Check for magic numbers
      if (/\b\d{3,}\b/.test(trimmed) && !trimmed.includes('//')) {
        violations++;
      }
    }

    return Math.min(violations, 15);
  }

  /**
   * Detect code duplication
   * @param {Array} files - Array of file objects from PR
   * @returns {number} Duplication score (0-10, lower is better)
   */
  async detectDuplication(files) {
    const codeBlocks = [];
    
    // Extract significant code blocks
    for (const file of files) {
      if (this.isCodeFile(file.filename) && file.patch) {
        const blocks = this.extractCodeBlocks(file.patch);
        codeBlocks.push(...blocks);
      }
    }

    // Find duplications
    let duplications = 0;
    for (let i = 0; i < codeBlocks.length; i++) {
      for (let j = i + 1; j < codeBlocks.length; j++) {
        if (this.areSimilarBlocks(codeBlocks[i], codeBlocks[j])) {
          duplications++;
        }
      }
    }

    return Math.min(duplications, 10);
  }

  /**
   * Extract meaningful code blocks from patch
   */
  extractCodeBlocks(patch) {
    const blocks = [];
    const lines = patch.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).map(line => line.substring(1).trim());
    
    // Group consecutive non-empty lines into blocks
    let currentBlock = [];
    
    for (const line of addedLines) {
      if (line.length > 10 && !line.startsWith('//') && !line.startsWith('/*')) {
        currentBlock.push(line);
      } else {
        if (currentBlock.length >= 3) {
          blocks.push(currentBlock.join('\n'));
        }
        currentBlock = [];
      }
    }
    
    if (currentBlock.length >= 3) {
      blocks.push(currentBlock.join('\n'));
    }

    return blocks;
  }

  /**
   * Check if two code blocks are similar
   */
  areSimilarBlocks(block1, block2) {
    if (block1.length < 50 || block2.length < 50) return false;
    
    // Simple similarity check
    const words1 = block1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const words2 = block2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    const intersection = words1.filter(w => words2.includes(w));
    const similarity = intersection.length / Math.max(words1.length, words2.length);
    
    return similarity > 0.7;
  }

  /**
   * Calculate maintainability index
   * @param {Array} files - Array of file objects from PR
   * @returns {number} Maintainability score (0-100)
   */
  async calculateMaintainability(files) {
    let totalScore = 0;
    let fileCount = 0;

    for (const file of files) {
      if (this.isCodeFile(file.filename) && file.patch) {
        const score = this.calculateFileMaintainability(file);
        totalScore += score;
        fileCount++;
      }
    }

    return fileCount > 0 ? totalScore / fileCount : 100;
  }

  /**
   * Calculate maintainability for a single file
   */
  calculateFileMaintainability(file) {
    const lines = file.patch.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).map(line => line.substring(1));
    
    if (addedLines.length === 0) return 100;

    let score = 100;
    
    // Factors that affect maintainability
    const avgLineLength = addedLines.reduce((sum, line) => sum + line.length, 0) / addedLines.length;
    const complexity = this.calculateCyclomaticComplexity(file.patch);
    const commentRatio = addedLines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length / addedLines.length;
    
    // Adjust score based on factors
    if (avgLineLength > 80) score -= 10;
    if (complexity > 10) score -= (complexity - 10) * 3;
    if (commentRatio < 0.1) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Analyze test quality and coverage
   */
  async analyzeTestQuality(files) {
    const testFiles = files.filter(file => this.isTestFile(file.filename));
    
    if (testFiles.length === 0) {
      return { score: 0, details: 'No test files found' };
    }

    let totalScore = 0;
    const analyses = [];

    for (const testFile of testFiles) {
      const analysis = this.analyzeTestFile(testFile);
      analyses.push(analysis);
      totalScore += analysis.score;
    }

    return {
      score: totalScore / testFiles.length,
      details: analyses,
      testFileCount: testFiles.length
    };
  }

  /**
   * Analyze a single test file
   */
  analyzeTestFile(file) {
    const lines = file.patch.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).map(line => line.substring(1));
    
    let score = 0;
    let testCount = 0;
    let assertionCount = 0;
    
    const testKeywords = ['test', 'it', 'describe', 'expect', 'assert', 'should'];
    const assertionKeywords = ['expect', 'assert', 'should', 'toBe', 'toEqual', 'toContain'];
    
    for (const line of addedLines) {
      const trimmed = line.trim().toLowerCase();
      
      // Count test cases
      if (testKeywords.some(keyword => trimmed.includes(keyword + '('))) {
        testCount++;
      }
      
      // Count assertions
      if (assertionKeywords.some(keyword => trimmed.includes(keyword))) {
        assertionCount++;
      }
    }
    
    // Calculate score based on test density
    if (addedLines.length > 0) {
      const testDensity = (testCount + assertionCount) / addedLines.length;
      score = Math.min(100, testDensity * 200);
    }
    
    return {
      score,
      testCount,
      assertionCount,
      filename: file.filename
    };
  }

  /**
   * Check if file is a code file
   */
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Check if file is a test file
   */
  isTestFile(filename) {
    return filename.includes('test') || 
           filename.includes('spec') || 
           filename.endsWith('.test.js') || 
           filename.endsWith('.spec.js') ||
           filename.endsWith('.test.ts') ||
           filename.endsWith('.spec.ts');
  }

  /**
   * Get file type based on extension
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust'
    };
    
    return typeMap[ext] || 'unknown';
  }

  /**
   * Generate analysis report
   */
  generateAnalysisReport(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        averageComplexity: results.complexity || 0,
        standardsCompliance: results.standards || 100,
        duplicationLevel: results.duplication || 0,
        maintainabilityIndex: results.maintainability || 100
      },
      recommendations: this.generateRecommendations(results),
      details: results
    };
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.complexity > 10) {
      recommendations.push('Consider breaking down complex functions into smaller, more manageable pieces');
    }
    
    if (results.standards < 80) {
      recommendations.push('Review and improve adherence to coding standards');
    }
    
    if (results.duplication > 3) {
      recommendations.push('Reduce code duplication by extracting common functionality');
    }
    
    if (results.maintainability < 70) {
      recommendations.push('Improve code maintainability by adding comments and simplifying logic');
    }
    
    return recommendations;
  }
}

module.exports = CodeAnalyzer;