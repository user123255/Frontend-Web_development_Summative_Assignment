// Campus Life Planner - Search Module
// Safe regex compilation and search highlighting

export class SearchManager {
    constructor() {
        this.lastSearchTerm = '';
        this.lastFlags = 'gi';
        this.compiledRegex = null;
        this.searchError = null;
    }

    // Safe regex compiler with error handling
    compileRegex(input, flags = 'i') {
        this.searchError = null;

        if (!input || typeof input !== 'string') {
            this.compiledRegex = null;
            return null;
        }

        // Reset if same as last search
        if (input === this.lastSearchTerm && flags === this.lastFlags) {
            return this.compiledRegex;
        }

        try {
            this.compiledRegex = new RegExp(input, flags);
            this.lastSearchTerm = input;
            this.lastFlags = flags;
            return this.compiledRegex;
        } catch (error) {
            this.searchError = error.message;
            console.warn('Regex compilation failed:', error.message);

            // Fallback to escaped literal search
            try {
                const escapedInput = this.escapeRegex(input);
                this.compiledRegex = new RegExp(escapedInput, flags);
                this.lastSearchTerm = input;
                this.lastFlags = flags;
                return this.compiledRegex;
            } catch (fallbackError) {
                console.error('Even escaped regex failed:', fallbackError);
                this.compiledRegex = null;
                return null;
            }
        }
    }

    // Escape special regex characters for literal search
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Get current search error
    getSearchError() {
        return this.searchError;
    }

    // Highlight matches in text with accessibility considerations
    highlight(text, regex, className = 'search-highlight') {
        if (!text || typeof text !== 'string' || !regex) {
            return text;
        }

        // Create a safe regex that won't cause infinite loops
        let safeRegex = regex;
        if (regex.global) {
            safeRegex = new RegExp(regex.source, regex.flags.replace('g', ''));
        }

        try {
            const matches = [];
            let match;
            let lastIndex = 0;
            const globalRegex = new RegExp(safeRegex.source, safeRegex.flags + 'g');

            // Find all matches
            while ((match = globalRegex.exec(text)) !== null) {
                matches.push({
                    text: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });

                // Prevent infinite loop on empty matches
                if (match[0].length === 0) {
                    break;
                }
            }

            if (matches.length === 0) {
                return text;
            }

            // Build highlighted text
            let result = '';
            let currentIndex = 0;

            matches.forEach((match, index) => {
                // Add text before match
                result += text.substring(currentIndex, match.start);

                // Add highlighted match with ARIA label for screen readers
                result += `<mark class="${className}" aria-label="Search match ${index + 1}">${match.text}</mark>`;

                currentIndex = match.end;
            });

            // Add remaining text
            result += text.substring(currentIndex);

            return result;
        } catch (error) {
            console.warn('Highlighting failed:', error);
            return text;
        }
    }

    // Search records with optional highlighting
    searchRecords(records, searchTerm, options = {}) {
        const {
            caseInsensitive = true,
            fields = ['title', 'tag', 'dueDate', 'duration', 'status'],
            highlight: shouldHighlight = false,
            highlightClassName = 'search-highlight'
        } = options;

        if (!searchTerm) {
            return {
                results: records,
                totalMatches: records.length,
                searchError: null,
                compiledRegex: null
            };
        }

        const flags = caseInsensitive ? 'gi' : 'g';
        const regex = this.compileRegex(searchTerm, flags);

        if (!regex) {
            return {
                results: [],
                totalMatches: 0,
                searchError: this.searchError,
                compiledRegex: null
            };
        }

        const results = records.filter(record => {
            const searchableText = fields.map(field => {
                const value = record[field];
                return typeof value === 'string' ? value : String(value);
            }).join(' ');

            return regex.test(searchableText);
        });

        // Add highlighting if requested
        if (shouldHighlight && results.length > 0) {
            results.forEach(record => {
                record._highlighted = {};
                fields.forEach(field => {
                    const value = record[field];
                    if (typeof value === 'string') {
                        record._highlighted[field] = this.highlight(value, regex, highlightClassName);
                    } else {
                        record._highlighted[field] = this.highlight(String(value), regex, highlightClassName);
                    }
                });
            });
        }

        return {
            results,
            totalMatches: results.length,
            searchError: null,
            compiledRegex: regex
        };
    }

    // Advanced search with multiple patterns
    advancedSearch(records, patterns, options = {}) {
        const {
            operator = 'AND', // 'AND' or 'OR'
            caseInsensitive = true,
            fields = ['title', 'tag', 'dueDate', 'duration', 'status']
        } = options;

        if (!patterns || patterns.length === 0) {
            return {
                results: records,
                totalMatches: records.length,
                errors: []
            };
        }

        const compiledPatterns = [];
        const errors = [];

        // Compile all patterns
        patterns.forEach((pattern, index) => {
            const flags = caseInsensitive ? 'gi' : 'g';
            const regex = this.compileRegex(pattern, flags);

            if (regex) {
                compiledPatterns.push(regex);
            } else {
                errors.push(`Pattern ${index + 1}: ${this.searchError || 'Unknown error'}`);
            }
        });

        if (compiledPatterns.length === 0) {
            return {
                results: [],
                totalMatches: 0,
                errors
            };
        }

        const results = records.filter(record => {
            const searchableText = fields.map(field => {
                const value = record[field];
                return typeof value === 'string' ? value : String(value);
            }).join(' ');

            if (operator === 'AND') {
                return compiledPatterns.every(regex => regex.test(searchableText));
            } else {
                return compiledPatterns.some(regex => regex.test(searchableText));
            }
        });

        return {
            results,
            totalMatches: results.length,
            errors
        };
    }

    // Predefined search patterns
    static getCommonPatterns() {
        return {
            // Campus Life Planner specific patterns
            tagFilter: {
                pattern: /^@(\w+)$/,
                description: 'Filter by tag: @math, @science',
                example: '@math'
            },

            timeTokens: {
                pattern: /\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/g,
                description: 'Find time references: 14:30, 9:00',
                example: '14:30'
            },

            dueDates: {
                pattern: /\b\d{4}-\d{2}-\d{2}\b/g,
                description: 'Find due dates in YYYY-MM-DD format',
                example: '2024-12-25'
            },

            durationPattern: {
                pattern: /\b\d+\.?\d*\s*(hours?|hrs?|h|minutes?|mins?|m)\b/gi,
                description: 'Find duration mentions',
                example: '2.5 hours'
            },

            duplicateWords: {
                pattern: /\b(\w+)\s+\1\b/gi,
                description: 'Find duplicate consecutive words',
                example: 'the the'
            },

            urgentKeywords: {
                pattern: /\b(urgent|asap|deadline|due|overdue|critical)\b/gi,
                description: 'Find urgent task keywords',
                example: 'urgent'
            },

            completedTasks: {
                pattern: /\b(completed?|done|finished|submitted)\b/gi,
                description: 'Find completed task indicators',
                example: 'completed'
            },

            subjects: {
                pattern: /\b(math|science|english|history|physics|chemistry|biology|computer|programming)\b/gi,
                description: 'Find academic subject mentions',
                example: 'math'
            }
        };
    }

    // Get suggestions based on search term
    getSuggestions(searchTerm, records, maxSuggestions = 5) {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        const suggestions = new Set();

        // Extract unique values from records
        const fields = ['title', 'tag'];
        records.forEach(record => {
            fields.forEach(field => {
                const value = record[field];
                if (typeof value === 'string' &&
                    value.toLowerCase().includes(searchTerm.toLowerCase())) {
                    suggestions.add(value);
                }
            });
        });

        // Add pattern suggestions
        const patterns = SearchManager.getCommonPatterns();
        Object.values(patterns).forEach(patternInfo => {
            if (patternInfo.example &&
                patternInfo.example.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.add(patternInfo.example);
            }
        });

        return Array.from(suggestions).slice(0, maxSuggestions);
    }

    // Test if search term is a valid regex
    isValidRegex(searchTerm) {
        try {
            new RegExp(searchTerm);
            return true;
        } catch {
            return false;
        }
    }

    // Get search statistics
    getSearchStats(searchResult) {
        if (!searchResult.results) {
            return null;
        }

        const stats = {
            totalMatches: searchResult.totalMatches,
            matchPercentage: 0,
            fieldMatches: {},
            hasError: !!searchResult.searchError
        };

        if (searchResult.results.length > 0 && searchResult.compiledRegex) {
            const regex = searchResult.compiledRegex;
            const fields = ['title', 'tag', 'dueDate', 'status'];

            fields.forEach(field => {
                const matchCount = searchResult.results.filter(record => {
                    const value = record[field];
                    return regex.test(typeof value === 'string' ? value : String(value));
                }).length;

                stats.fieldMatches[field] = matchCount;
            });
        }

        return stats;
    }

    // Clean up highlighted content for accessibility
    cleanHighlighting(htmlContent) {
        if (!htmlContent) return '';

        // Remove highlight tags but keep the content
        return htmlContent.replace(/<mark[^>]*>/g, '').replace(/<\/mark>/g, '');
    }
}

// Utility functions
export function compileRegex(input, flags = 'i') {
    const searchManager = new SearchManager();
    return searchManager.compileRegex(input, flags);
}

export function highlight(text, regex, className = 'search-highlight') {
    const searchManager = new SearchManager();
    return searchManager.highlight(text, regex, className);
}

export function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export singleton instance
export const searchManager = new SearchManager();