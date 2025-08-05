const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const similarity = require('similarity');

class FeatureDetector {
  constructor(config) {
    this.config = config;
    this.octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  }

  /**
   * Detect if multiple PRs are working on the same feature
   * @param {Object} currentPR - The current PR object
   * @returns {Array} Array of related PR numbers
   */
  async detectRelatedPRs(currentPR) {
    try {
      const { owner, repo } = github.context.repo;
      const openPRs = await this.getOpenPRs(owner, repo);
      const relatedPRs = [];

      for (const pr of openPRs) {
        if (pr.number === currentPR.number) continue;

        const isRelated = await this.isPRRelated(currentPR, pr);
        if (isRelated) {
          relatedPRs.push({
            number: pr.number,
            title: pr.title,
            head: pr.head.ref,
            author: pr.user.login,
            created_at: pr.created_at,
            updated_at: pr.updated_at
          });
        }
      }

      return relatedPRs;
    } catch (error) {
      core.setFailed(`Feature detection failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all open PRs in the repository
   */
  async getOpenPRs(owner, repo) {
    const { data } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'created',
      direction: 'desc'
    });
    return data;
  }

  /**
   * Check if two PRs are working on the same feature
   */
  async isPRRelated(pr1, pr2) {
    // Check branch naming patterns
    if (this.isBranchRelated(pr1.head.ref, pr2.head.ref)) {
      return true;
    }

    // Check label similarity
    if (await this.areLabelsRelated(pr1, pr2)) {
      return true;
    }

    // Check title similarity
    if (this.areTitlesRelated(pr1.title, pr2.title)) {
      return true;
    }

    // Check file overlap
    if (await this.hasFileOverlap(pr1, pr2)) {
      return true;
    }

    return false;
  }

  /**
   * Check if branch names suggest they're working on the same feature
   */
  isBranchRelated(branch1, branch2) {
    const patterns = this.config.featureDetection.branchPatterns;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace('*', '(.+)'));
      const match1 = branch1.match(regex);
      const match2 = branch2.match(regex);
      
      if (match1 && match2) {
        // Extract feature names and check similarity
        const feature1 = match1[1].toLowerCase();
        const feature2 = match2[1].toLowerCase();
        
        if (similarity(feature1, feature2) > 0.6) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if PRs have related labels
   */
  async areLabelsRelated(pr1, pr2) {
    const { owner, repo } = github.context.repo;
    
    const [pr1Details, pr2Details] = await Promise.all([
      this.octokit.rest.pulls.get({ owner, repo, pull_number: pr1.number }),
      this.octokit.rest.pulls.get({ owner, repo, pull_number: pr2.number })
    ]);

    const labels1 = pr1Details.data.labels.map(label => label.name.toLowerCase());
    const labels2 = pr2Details.data.labels.map(label => label.name.toLowerCase());
    
    const keywords = this.config.featureDetection.labelKeywords;
    
    for (const keyword of keywords) {
      const hasKeyword1 = labels1.some(label => label.includes(keyword));
      const hasKeyword2 = labels2.some(label => label.includes(keyword));
      
      if (hasKeyword1 && hasKeyword2) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if PR titles are similar
   */
  areTitlesRelated(title1, title2) {
    const threshold = this.config.featureDetection.titleSimilarityThreshold;
    return similarity(title1.toLowerCase(), title2.toLowerCase()) > threshold;
  }

  /**
   * Check if PRs modify overlapping files
   */
  async hasFileOverlap(pr1, pr2) {
    const { owner, repo } = github.context.repo;
    
    const [files1, files2] = await Promise.all([
      this.getPRFiles(owner, repo, pr1.number),
      this.getPRFiles(owner, repo, pr2.number)
    ]);

    const fileSet1 = new Set(files1.map(f => f.filename));
    const fileSet2 = new Set(files2.map(f => f.filename));
    
    const intersection = new Set([...fileSet1].filter(x => fileSet2.has(x)));
    const union = new Set([...fileSet1, ...fileSet2]);
    
    const overlapRatio = intersection.size / union.size;
    return overlapRatio > this.config.featureDetection.fileOverlapThreshold;
  }

  /**
   * Get files modified in a PR
   */
  async getPRFiles(owner, repo, pullNumber) {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber
    });
    return data;
  }

  /**
   * Group related PRs by feature
   */
  async groupPRsByFeature(prs) {
    const groups = [];
    const processed = new Set();

    for (const pr of prs) {
      if (processed.has(pr.number)) continue;

      const relatedPRs = await this.detectRelatedPRs(pr);
      if (relatedPRs.length > 0) {
        const group = {
          feature: this.extractFeatureName(pr),
          prs: [pr, ...relatedPRs],
          created_at: new Date().toISOString()
        };
        
        groups.push(group);
        processed.add(pr.number);
        relatedPRs.forEach(rpr => processed.add(rpr.number));
      }
    }

    return groups;
  }

  /**
   * Extract feature name from PR
   */
  extractFeatureName(pr) {
    // Try to extract from branch name first
    const patterns = this.config.featureDetection.branchPatterns;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace('*', '(.+)'));
      const match = pr.head.ref.match(regex);
      
      if (match) {
        return match[1].replace(/-/g, ' ').replace(/_/g, ' ');
      }
    }
    
    // Fallback to PR title
    return pr.title.substring(0, 50);
  }
}

module.exports = FeatureDetector;