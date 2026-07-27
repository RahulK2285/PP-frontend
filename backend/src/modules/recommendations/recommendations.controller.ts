import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Problem } from '../dsa/problem.model';

interface TopicRecommendation {
  topic: string;
  level: 'weak' | 'moderate' | 'strong';
  solved: number; // Maintained for frontend compatibility
  target: number; // Maintained for frontend compatibility
  percentage: number; // Now represents Weighted Mastery Index Score
  suggestions: string[];
}

// 10+ suggested practice problems per topic (curated from NeetCode/Blind 75/LeetCode Top)
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  'Arrays': [
    'Two Sum', 'Best Time to Buy and Sell Stock', 'Product of Array Except Self',
    'Maximum Subarray', 'Contains Duplicate', 'Maximum Product Subarray',
    '3Sum', 'Container With Most Water', 'Trapping Rain Water',
    'Next Permutation', 'Set Matrix Zeroes', 'Rotate Image',
    'First Missing Positive', 'Merge Sorted Array', 'Remove Duplicates from Sorted Array',
  ],
  'Strings': [
    'Longest Substring Without Repeating Characters', 'Valid Anagram', 'Group Anagrams',
    'Longest Palindromic Substring', 'String to Integer (atoi)', 'Valid Parentheses',
    'Longest Common Prefix', 'Roman to Integer', 'Integer to Roman',
    'Implement strStr()', 'Zigzag Conversion', 'Minimum Window Substring',
    'Palindrome Partitioning', 'Decode Ways', 'Count and Say',
  ],
  'Linked List': [
    'Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle',
    'Remove Nth Node From End', 'Add Two Numbers', 'Palindrome Linked List',
    'Intersection of Two Linked Lists', 'Sort List', 'Reorder List',
    'Copy List with Random Pointer', 'Reverse Nodes in k-Group', 'Odd Even Linked List',
  ],
  'Trees': [
    'Maximum Depth of Binary Tree', 'Invert Binary Tree', 'Validate BST',
    'Binary Tree Level Order Traversal', 'Lowest Common Ancestor',
    'Symmetric Tree', 'Binary Tree Inorder Traversal', 'Construct Binary Tree from Preorder and Inorder',
    'Kth Smallest Element in BST', 'Serialize and Deserialize Binary Tree',
    'Path Sum', 'Binary Tree Maximum Path Sum', 'Diameter of Binary Tree',
    'Flatten Binary Tree to Linked List', 'Same Tree',
  ],
  'Graphs': [
    'Number of Islands', 'Clone Graph', 'Course Schedule', 'Course Schedule II',
    'Pacific Atlantic Water Flow', 'Graph Valid Tree', 'Number of Connected Components',
    'Word Ladder', 'Surrounded Regions', 'Rotting Oranges',
    'Shortest Path in Binary Matrix', 'Network Delay Time', 'Alien Dictionary',
  ],
  'DP': [
    'Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence',
    'House Robber', 'House Robber II', 'Unique Paths', 'Jump Game',
    'Word Break', 'Decode Ways', 'Maximum Product Subarray',
    'Partition Equal Subset Sum', 'Target Sum', 'Edit Distance',
    'Longest Common Subsequence', 'Best Time to Buy and Sell Stock with Cooldown',
  ],
  'Binary Search': [
    'Binary Search', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array',
    'Search a 2D Matrix', 'Koko Eating Bananas', 'Median of Two Sorted Arrays',
    'Time Based Key-Value Store', 'Find Peak Element', 'Search Insert Position',
    'Capacity To Ship Packages Within D Days', 'Split Array Largest Sum',
  ],
  'Backtracking': [
    'Subsets', 'Subsets II', 'Permutations', 'Permutations II',
    'Combination Sum', 'Combination Sum II', 'Word Search', 'N-Queens',
    'Palindrome Partitioning', 'Letter Combinations of a Phone Number',
    'Generate Parentheses', 'Sudoku Solver',
  ],
  'Stack': [
    'Valid Parentheses', 'Min Stack', 'Daily Temperatures',
    'Evaluate Reverse Polish Notation', 'Largest Rectangle in Histogram',
    'Car Fleet', 'Asteroid Collision', 'Generate Parentheses',
    'Implement Stack using Queues', 'Next Greater Element I',
    'Trapping Rain Water', 'Basic Calculator',
  ],
  'Queue': [
    'Implement Queue using Stacks', 'Design Circular Queue',
    'Sliding Window Maximum', 'Number of Recent Calls',
    'Rotting Oranges', 'Walls and Gates', 'Open the Lock',
    'Perfect Squares', 'Binary Tree Level Order Traversal',
    'Shortest Path in Binary Matrix',
  ],
  'Heap': [
    'Kth Largest Element', 'Top K Frequent Elements', 'Find Median from Data Stream',
    'Merge K Sorted Lists', 'Task Scheduler', 'K Closest Points to Origin',
    'Reorganize String', 'Kth Smallest Element in Sorted Matrix',
    'Meeting Rooms II', 'IPO', 'Last Stone Weight',
  ],
  'Greedy': [
    'Jump Game', 'Jump Game II', 'Gas Station', 'Hand of Straights',
    'Merge Triplets', 'Partition Labels', 'Valid Parenthesis String',
    'Maximum Subarray', 'Task Scheduler', 'Non-overlapping Intervals',
    'Meeting Rooms', 'Minimum Number of Arrows to Burst Balloons',
  ],
  'Two Pointers': [
    'Valid Palindrome', 'Two Sum II', '3Sum', 'Container With Most Water',
    'Trapping Rain Water', 'Move Zeroes', 'Remove Duplicates from Sorted Array',
    'Sort Colors', 'Boats to Save People', 'Squares of a Sorted Array',
    '4Sum', 'Backspace String Compare',
  ],
  'Sliding Window': [
    'Minimum Window Substring', 'Longest Repeating Character Replacement',
    'Permutation in String', 'Minimum Size Subarray Sum', 'Sliding Window Maximum',
    'Fruit Into Baskets', 'Longest Substring Without Repeating Characters',
    'Best Time to Buy and Sell Stock', 'Contains Duplicate II',
    'Max Consecutive Ones III', 'Grumpy Bookstore Owner',
  ],
  'Trie': [
    'Implement Trie', 'Design Add and Search Words', 'Word Search II',
    'Replace Words', 'Implement Magic Dictionary', 'Map Sum Pairs',
    'Longest Word in Dictionary', 'Maximum XOR of Two Numbers',
    'Stream of Characters', 'Search Suggestions System',
  ],
  'Hash Table': [
    'Two Sum', 'Group Anagrams', 'Top K Frequent Elements', 'Valid Sudoku',
    'Encode and Decode Strings', 'Longest Consecutive Sequence', 'Contains Duplicate',
    'Valid Anagram', 'Subarray Sum Equals K', 'LRU Cache',
    'Design HashMap', 'Isomorphic Strings',
  ],
  'Bit Manipulation': [
    'Single Number', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits',
    'Missing Number', 'Sum of Two Integers', 'Power of Two',
    'Hamming Distance', 'Bitwise AND of Numbers Range',
    'Subsets (using bitmask)', 'Complement of Base 10 Integer',
  ],
  'Math': [
    'Happy Number', 'Plus One', 'Pow(x,n)', 'Rotate Image', 'Spiral Matrix',
    'Palindrome Number', 'Reverse Integer', 'Excel Sheet Column Number',
    'Factorial Trailing Zeroes', 'Sqrt(x)', 'Count Primes',
    'GCD of Strings', 'Multiply Strings',
  ],
  'Sorting': [
    'Merge Intervals', 'Insert Interval', 'Non-overlapping Intervals',
    'Meeting Rooms', 'Meeting Rooms II', 'Sort Colors',
    'Kth Largest Element', 'Largest Number', 'Sort an Array',
    'Valid Anagram', 'Top K Frequent Elements', 'Wiggle Sort',
  ],
};

// Target solve counts per topic (considered "strong")
const TOPIC_TARGETS: Record<string, number> = {
  'Arrays': 15, 'Strings': 10, 'Linked List': 8, 'Trees': 12, 'Graphs': 10,
  'DP': 15, 'Binary Search': 8, 'Backtracking': 8, 'Stack': 8, 'Queue': 5,
  'Heap': 6, 'Greedy': 8, 'Two Pointers': 8, 'Sliding Window': 6, 'Trie': 4,
  'Hash Table': 10, 'Bit Manipulation': 5, 'Math': 5, 'Sorting': 6,
};

// Difficulty weight map for calculating Mastery Index
const DIFFICULTY_WEIGHTS = { 'Easy': 1, 'Medium': 3, 'Hard': 5 };

export const recommendationsController = {
  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const problems = await Problem.find({ userId: req.user!._id, status: 'Solved' });

      const filterTopic = req.query.topic as string | undefined;

      // Count solved per topic and store metadata for weighted scores + knowledge decay
      const topicMetrics: Record<string, { count: number; rawWeight: number; lastSolvedAt: Date | null }> = {};
      
      for (const [topic] of Object.entries(TOPIC_TARGETS)) {
        topicMetrics[topic] = { count: 0, rawWeight: 0, lastSolvedAt: null };
      }

      for (const p of problems) {
        if (topicMetrics[p.topic]) {
          topicMetrics[p.topic].count += 1;
          topicMetrics[p.topic].rawWeight += DIFFICULTY_WEIGHTS[p.difficulty] || 3;
          
          const problemDate = p.solvedAt || p.updatedAt;
          if (problemDate) {
            const currentLastSolved = topicMetrics[p.topic].lastSolvedAt;
            if (!currentLastSolved || new Date(problemDate) > currentLastSolved) {
              topicMetrics[p.topic].lastSolvedAt = new Date(problemDate);
            }
          }
        }
      }

      const recommendations: TopicRecommendation[] = [];

      for (const [topic, target] of Object.entries(TOPIC_TARGETS)) {
        if (filterTopic && topic !== filterTopic) continue;

        const metrics = topicMetrics[topic] || { count: 0, rawWeight: 0, lastSolvedAt: null };
        
        // 1. Calculate Target weight floor assuming average difficulty profile (Medium = 3 weight units)
        const targetWeightCapacity = target * 3;
        let baselinePercentage = Math.round((metrics.rawWeight / targetWeightCapacity) * 100);
        baselinePercentage = Math.min(baselinePercentage, 100);

        // 2. Factor in Knowledge Decay (Reduces Mastery Score if left unpracticed for > 14 days)
        let finalPercentage = baselinePercentage;
        if (metrics.lastSolvedAt && baselinePercentage > 0) {
          const daysSinceLastSolved = Math.floor(
            (Date.now() - metrics.lastSolvedAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastSolved > 14) {
            const decayFactor = Math.min((daysSinceLastSolved - 14) * 1.5, 30); // Max 30% penalty drop
            finalPercentage = Math.max(Math.round(baselinePercentage - decayFactor), 0);
          }
        }

        // Maintain thresholds for level mapping
        let level: 'weak' | 'moderate' | 'strong';
        if (finalPercentage < 30) level = 'weak';
        else if (finalPercentage < 70) level = 'moderate';
        else level = 'strong';

        const maxSuggestions = filterTopic ? 10 : 5;
        const allSuggestions = TOPIC_SUGGESTIONS[topic] || [];
        const solvedTitles = problems
          .filter(p => p.topic === topic)
          .map(p => p.title.toLowerCase());

        const suggestions = allSuggestions.filter(
          s => !solvedTitles.some(t => t.includes(s.toLowerCase()))
        ).slice(0, maxSuggestions);

        recommendations.push({
          topic,
          level,
          solved: metrics.count,
          target,
          percentage: finalPercentage, // Overridden seamlessly with Weighted Spaced Repetition score
          suggestions: suggestions.length > 0 ? suggestions : ['All suggested problems solved! Keep exploring!'],
        });
      }

      const order = { weak: 0, moderate: 1, strong: 2 };
      recommendations.sort((a, b) => order[a.level] - order[b.level]);

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
