const core = require('@actions/core');
const github = require('@actions/github');
const similarity = require('similarity');

class SnippetExtractor {
  constructor(config) {
    this.config = config;
    this.octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  }

  /**
   * Extract superior code snippets from losing PRs
   * @param {Object} winningPR - The selected PR
   * @param {Array} losingPRs - Array of losing PRs
   * @returns {Array} Array of superior snippets to integrate
   */
  async extractSuperiorSnippets(winningPR, losingPRs) {
    try {
      const snippets = [];
      const winningFiles = await this.getPRFiles(winningPR.number);
      
      for (const losingPR of losingPRs) {
        const losingFiles = await this.getPRFiles(losingPR.number);
        const prSnippets = await this.compareAndExtractSnippets(winningFiles, losingFiles, losingPR);
        snippets.push(...prSnippets);
      }

      // Deduplicate and rank snippets
      const rankedSnippets = this.rankSnippets(snippets);
      
      return rankedSnippets.slice(0, 10); // Return top 10 snippets
    } catch (error) {
      core.setFailed(`Snippet extraction failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Compare files between winning and losing PRs to find superior snippets
   */
  async compareAndExtractSnippets(winningFiles, losingFiles, losingPR) {
    const snippets = [];
    const fileMap = new Map();
    
    // Create map of winning files
    winningFiles.forEach(file => {
      fileMap.set(file.filename, file);
    });

    for (const losingFile of losingFiles) {
      const winningFile = fileMap.get(losingFile.filename);
      
      if (winningFile) {
        // Files exist in both PRs, compare implementations
        const fileSnippets = await this.compareFileImplementations(
          winningFile, 
          losingFile, 
          losingPR
        );
        snippets.push(...fileSnippets);
      } else {
        // File only exists in losing PR, might be worth considering
        const newFileSnippets = await this.analyzeNewFileContribution(
          losingFile, 
          losingPR
        );
        snippets.push(...newFileSnippets);
      }
    }

    return snippets;
  }

  /**
   * Compare implementations of the same file in two PRs
   */
  async compareFileImplementations(winningFile, losingFile, losingPR) {
    const snippets = [];
    
    try {
      const winningChanges = this.extractCodeChanges(winningFile.patch);
      const losingChanges = this.extractCodeChanges(losingFile.patch);
      
      // Analyze different approaches to similar problems
      const comparisons = this.findSimilarChangeRegions(winningChanges, losingChanges);
      
      for (const comparison of comparisons) {
        const quality = await this.evaluateSnippetQuality(comparison.losingSnippet);
        
        if (quality.score > 75) { // Only consider high-quality snippets
          snippets.push({
            type: 'improvement',
            filename: losingFile.filename,
            snippet: comparison.losingSnippet,
            winningAlternative: comparison.winningSnippet,
            quality,
            pr: {
              number: losingPR.number,
              title: losingPR.title,
              author: losingPR.author
            },
            reasoning: quality.reasoning,
            integrationComplexity: this.assessIntegrationComplexity(comparison)
          });
        }
      }
    } catch (error) {
      core.warning(`Failed to compare file implementations: ${error.message}`);
    }

    return snippets;
  }

  /**
   * Analyze new file contributions from losing PRs
   */
  async analyzeNewFileContribution(file, losingPR) {
    const snippets = [];
    
    try {
      if (file.status === 'added') {
        const quality = await this.evaluateFileQuality(file);
        
        if (quality.score > 80) {
          snippets.push({
            type: 'new_file',
            filename: file.filename,
            snippet: file.patch,
            quality,
            pr: {
              number: losingPR.number,
              title: losingPR.title,
              author: losingPR.author
            },
            reasoning: `New file with high quality: ${quality.reasoning}`,
            integrationComplexity: 'medium'
          });
        }
      } else {
        // Analyze added functions/methods in existing files
        const functions = this.extractAddedFunctions(file.patch);
        
        for (const func of functions) {
          const quality = await this.evaluateFunctionQuality(func);
          
          if (quality.score > 80) {
            snippets.push({
              type: 'function',
              filename: file.filename,
              snippet: func.code,
              functionName: func.name,
              quality,
              pr: {
                number: losingPR.number,
                title: losingPR.title,
                author: losingPR.author
              },
              reasoning: `High-quality function: ${quality.reasoning}`,
              integrationComplexity: 'low'
            });
          }
        }
      }
    } catch (error) {
      core.warning(`Failed to analyze new file contribution: ${error.message}`);
    }

    return snippets;
  }

  /**
   * Extract code changes from a patch
   */
  extractCodeChanges(patch) {
    if (!patch) return [];
    
    const changes = [];
    const lines = patch.split('\n');
    let currentChange = [];
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentChange.push(line.substring(1));
      } else {
        if (currentChange.length > 0) {
          changes.push({
            code: currentChange.join('\n'),
            lineCount: currentChange.length
          });
          currentChange = [];
        }
      }
    }
    
    if (currentChange.length > 0) {
      changes.push({
        code: currentChange.join('\n'),
        lineCount: currentChange.length
      });
    }
    
    return changes.filter(change => change.lineCount > 2); // Only meaningful changes
  }

  /**
   * Find similar change regions between two sets of changes
   */
  findSimilarChangeRegions(winningChanges, losingChanges) {
    const comparisons = [];
    
    for (const losingChange of losingChanges) {
      for (const winningChange of winningChanges) {
        const similarity_score = this.calculateCodeSimilarity(
          winningChange.code, 
          losingChange.code
        );
        
        if (similarity_score > 0.3 && similarity_score < 0.8) {
          // Similar enough to be comparable, different enough to be interesting
          comparisons.push({
            winningSnippet: winningChange,
            losingSnippet: losingChange,
            similarity: similarity_score
          });
        }
      }
    }
    
    return comparisons;
  }

  /**
   * Calculate similarity between two code snippets
   */
  calculateCodeSimilarity(code1, code2) {
    // Normalize code for comparison
    const normalize = (code) => {
      return code
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[{}();,]/g, '')
        .trim();
    };
    
    return similarity(normalize(code1), normalize(code2));
  }

  /**
   * Evaluate quality of a code snippet
   */
  async evaluateSnippetQuality(snippet) {
    let score = 50; // Base score
    const reasoning = [];
    
    const code = snippet.code || snippet;
    
    // Check for best practices
    if (this.hasErrorHandling(code)) {
      score += 15;
      reasoning.push('Includes error handling');
    }
    
    if (this.hasInputValidation(code)) {
      score += 10;
      reasoning.push('Includes input validation');
    }
    
    if (this.hasGoodNaming(code)) {
      score += 10;
      reasoning.push('Uses descriptive naming');
    }
    
    if (this.hasComments(code)) {
      score += 8;
      reasoning.push('Well documented with comments');
    }
    
    if (this.isWellStructured(code)) {
      score += 12;
      reasoning.push('Well structured and organized');
    }
    
    if (this.hasTestCoverage(code)) {
      score += 15;
      reasoning.push('Includes or supports testing');
    }
    
    // Check for performance optimizations
    if (this.hasPerformanceOptimizations(code)) {
      score += 10;
      reasoning.push('Includes performance optimizations');
    }
    
    // Deduct points for issues
    if (this.hasCodeSmells(code)) {
      score -= 15;
      reasoning.push('Contains potential code smells');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: reasoning.join(', ')
    };
  }

  /**
   * Evaluate quality of an entire file
   */
  async evaluateFileQuality(file) {
    const content = file.patch || '';
    let score = 60; // Base score for new files
    const reasoning = [];
    
    // Check file structure
    if (this.hasProperFileStructure(content)) {
      score += 15;
      reasoning.push('Well-structured file');
    }
    
    // Check for comprehensive functionality
    if (this.hasComprehensiveFunctionality(content)) {
      score += 20;
      reasoning.push('Comprehensive functionality');
    }
    
    return this.evaluateSnippetQuality({ code: content });
  }

  /**
   * Evaluate quality of a function
   */
  async evaluateFunctionQuality(func) {
    let score = 55; // Base score for functions
    const reasoning = [];
    
    // Function-specific checks
    if (func.parameters && func.parameters.length > 0) {
      score += 5;
      reasoning.push('Takes parameters');
    }
    
    if (func.hasReturnValue) {
      score += 5;
      reasoning.push('Returns a value');
    }
    
    if (func.code.length > 50 && func.code.length < 500) {
      score += 10;
      reasoning.push('Appropriate function length');
    }
    
    const qualityResult = await this.evaluateSnippetQuality(func.code);
    
    return {
      score: Math.min(100, score + qualityResult.score * 0.3),
      reasoning: reasoning.concat(qualityResult.reasoning).join(', ')
    };
  }

  /**
   * Extract added functions from a patch
   */
  extractAddedFunctions(patch) {
    const functions = [];
    const lines = patch.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).map(line => line.substring(1));
    
    let currentFunction = null;
    let braceCount = 0;
    
    for (const line of addedLines) {
      const trimmed = line.trim();
      
      // Detect function declarations
      const functionMatch = trimmed.match(/(?:function\s+(\w+)|(\w+)\s*\([^)]*\)\s*\{|(\w+)\s*:\s*function)/);
      
      if (functionMatch && !currentFunction) {
        currentFunction = {
          name: functionMatch[1] || functionMatch[2] || functionMatch[3],
          code: line + '\n',
          parameters: this.extractParameters(trimmed),
          hasReturnValue: false
        };
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      } else if (currentFunction) {
        currentFunction.code += line + '\n';
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        
        if (trimmed.includes('return')) {
          currentFunction.hasReturnValue = true;
        }
        
        if (braceCount === 0) {
          functions.push(currentFunction);
          currentFunction = null;
        }
      }
    }
    
    return functions.filter(func => func.code.length > 50); // Only substantial functions
  }

  /**
   * Extract parameters from function declaration
   */
  extractParameters(functionDeclaration) {
    const paramMatch = functionDeclaration.match(/\(([^)]*)\)/);
    if (paramMatch && paramMatch[1]) {
      return paramMatch[1].split(',').map(p => p.trim()).filter(p => p.length > 0);
    }
    return [];
  }

  /**
   * Rank snippets by quality and integration ease
   */
  rankSnippets(snippets) {
    return snippets.sort((a, b) => {
      // Primary sort by quality score
      if (a.quality.score !== b.quality.score) {
        return b.quality.score - a.quality.score;
      }
      
      // Secondary sort by integration complexity (lower is better)
      const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
      return complexityOrder[a.integrationComplexity] - complexityOrder[b.integrationComplexity];
    });
  }

  /**
   * Assess integration complexity
   */
  assessIntegrationComplexity(comparison) {
    const winningLines = comparison.winningSnippet.lineCount;
    const losingLines = comparison.losingSnippet.lineCount;
    const sizeDiff = Math.abs(winningLines - losingLines);
    
    if (sizeDiff < 5) return 'low';
    if (sizeDiff < 15) return 'medium';
    return 'high';
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

  // Quality check helper methods
  hasErrorHandling(code) {
    const errorKeywords = ['try', 'catch', 'throw', 'error', 'exception'];
    return errorKeywords.some(keyword => code.toLowerCase().includes(keyword));
  }

  hasInputValidation(code) {
    const validationKeywords = ['validate', 'check', 'verify', 'assert', 'typeof', 'instanceof'];
    return validationKeywords.some(keyword => code.toLowerCase().includes(keyword));
  }

  hasGoodNaming(code) {
    // Check for descriptive variable/function names
    const words = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    const descriptiveNames = words.filter(word => word.length > 3 && !/^[a-z]$/.test(word));
    return descriptiveNames.length > words.length * 0.7;
  }

  hasComments(code) {
    return code.includes('//') || code.includes('/*') || code.includes('#');
  }

  isWellStructured(code) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const indentedLines = lines.filter(line => /^\s+/.test(line));
    
    // Good structure has appropriate indentation
    return indentedLines.length > nonEmptyLines.length * 0.3;
  }

  hasTestCoverage(code) {
    const testKeywords = ['test', 'spec', 'describe', 'it', 'expect', 'assert'];
    return testKeywords.some(keyword => code.toLowerCase().includes(keyword));
  }

  hasPerformanceOptimizations(code) {
    const perfKeywords = ['cache', 'memo', 'optimize', 'efficient', 'performance'];
    return perfKeywords.some(keyword => code.toLowerCase().includes(keyword));
  }

  hasCodeSmells(code) {
    // Check for potential code smells
    const smells = [
      code.includes('TODO'), // TODO comments
      code.includes('FIXME'), // FIXME comments
      (code.match(/if\s*\(/g) || []).length > 5, // Too many conditionals
      code.length > 1000, // Very long snippets
      /\b[a-z]\b/.test(code) && !/(for|if|in)\s+[a-z]\b/.test(code) // Single letter variables
    ];
    
    return smells.filter(Boolean).length > 1;
  }

  hasProperFileStructure(content) {
    // Check for file-level structure indicators
    const structureIndicators = [
      'module.exports',
      'export',
      'import',
      'require',
      'class',
      'function'
    ];
    
    return structureIndicators.some(indicator => content.includes(indicator));
  }

  hasComprehensiveFunctionality(content) {
    const functionalityIndicators = [
      (content.match(/function/g) || []).length > 2,
      (content.match(/class/g) || []).length > 0,
      content.length > 200,
      (content.match(/\{/g) || []).length > 3
    ];
    
    return functionalityIndicators.filter(Boolean).length > 1;
  }

  /**
   * Generate integration plan for snippets
   */
  generateIntegrationPlan(snippets) {
    const plan = {
      totalSnippets: snippets.length,
      byType: {},
      byComplexity: {},
      recommendedOrder: [],
      estimatedEffort: 0
    };

    // Group by type and complexity
    snippets.forEach(snippet => {
      plan.byType[snippet.type] = (plan.byType[snippet.type] || 0) + 1;
      plan.byComplexity[snippet.integrationComplexity] = 
        (plan.byComplexity[snippet.integrationComplexity] || 0) + 1;
    });

    // Recommend integration order (low complexity first)
    plan.recommendedOrder = snippets
      .filter(s => s.integrationComplexity === 'low')
      .concat(snippets.filter(s => s.integrationComplexity === 'medium'))
      .concat(snippets.filter(s => s.integrationComplexity === 'high'));

    // Estimate effort (in hours)
    const effortMap = { low: 1, medium: 3, high: 8 };
    plan.estimatedEffort = snippets.reduce((total, snippet) => {
      return total + effortMap[snippet.integrationComplexity];
    }, 0);

    return plan;
  }
}

module.exports = SnippetExtractor;