// Campus Life Planner - Validators Module
// Comprehensive regex validation with advanced patterns
// Human-friendly notes: patterns contain only the regex (no side-effect flags for .test())

export class Validators {
    // Validation patterns with descriptions
    static patterns = {
        // Basic validations
        title: {
            pattern: /^\S(?:.*\S)?$/,
            description: 'Title must not have leading/trailing spaces and collapse multiple spaces',
            test: (value) => {
                if (!value || typeof value !== 'string') return false;
                // Also check for collapsed double spaces
                return Validators.patterns.title.pattern.test(value) && !/\s{2,}/.test(value);
            }
        },

        duration: {
            pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
            description: 'Duration must be a valid number with up to 2 decimal places',
            test: (value) => {
                const num = parseFloat(value);
                return Validators.patterns.duration.pattern.test(String(value)) &&
                    !isNaN(num) && num >= 0 && num <= 24;
            }
        },

        date: {
            pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
            description: 'Date must be in YYYY-MM-DD format',
            test: (value) => {
                if (!Validators.patterns.date.pattern.test(value)) return false;
                const date = new Date(value);
                return !isNaN(date.getTime()) && date.toISOString().startsWith(value);
            }
        },

        tag: {
            pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
            description: 'Category/tag can contain letters, spaces, and hyphens only',
            test: (value) => {
                return typeof value === 'string' &&
                    Validators.patterns.tag.pattern.test(value) &&
                    value.length >= 2 && value.length <= 50;
            }
        },

        // Advanced regex patterns
        // Use case-insensitive (i) but avoid global (g) for .test() checks to prevent lastIndex issues
        duplicateWords: {
            pattern: /\b(\w+)\s+\1\b/i,
            description: 'Detects duplicate consecutive words (advanced back-reference)',
            test: (value) => {
                if (typeof value !== 'string') return false;
                return Validators.patterns.duplicateWords.pattern.test(value);
            }
        },

        timeTokens: {
            // This pattern can be used with a global search, but .test() uses non-global variant if needed
            pattern: /\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/g,
            description: 'Finds time tokens in HH:MM format',
            test: (value) => {
                if (typeof value !== 'string') return false;
                const matches = value.match(Validators.patterns.timeTokens.pattern);
                return matches ? matches.length > 0 : false;
            }
        },

        strongPassword: {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            description: 'Strong password with lookahead assertions (8+ chars, uppercase, lowercase, digit, special char)',
            test: (value) => {
                return typeof value === 'string' && Validators.patterns.strongPassword.pattern.test(value);
            }
        },

        noLeadingZeros: {
            pattern: /^(?!0\d)\d+(\.\d{1,2})?$/,
            description: 'Numbers without leading zeros using negative lookahead',
            test: (value) => {
                return typeof value === 'string' && Validators.patterns.noLeadingZeros.pattern.test(value);
            }
        },

        emailAdvanced: {
            pattern: /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            description: 'Advanced email validation with lookahead for length constraints',
            test: (value) => {
                return typeof value === 'string' && Validators.patterns.emailAdvanced.pattern.test(value);
            }
        }
    };

    // Validation functions for each field
    static validateTitle(value) {
        if (!value || typeof value !== 'string') {
            return { valid: false, error: 'Title is required and must be a string' };
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return { valid: false, error: 'Title cannot be empty' };
        }

        if (!this.patterns.title.test(trimmed)) {
            return {
                valid: false,
                error: 'Title must not have leading/trailing spaces or multiple consecutive spaces'
            };
        }

        // Use the non-global duplicateWords.pattern (with 'i' flag) to check duplicates
        if (this.patterns.duplicateWords.pattern.test(trimmed)) {
            return {
                valid: false,
                error: 'Title contains duplicate consecutive words'
            };
        }

        if (trimmed.length < 3 || trimmed.length > 100) {
            return { valid: false, error: 'Title must be between 3 and 100 characters' };
        }

        return { valid: true, value: trimmed };
    }

    static validateDuration(value) {
        if (value === null || value === undefined || value === '') {
            return { valid: false, error: 'Duration is required' };
        }

        const stringValue = String(value);
        if (!this.patterns.duration.pattern.test(stringValue)) {
            return {
                valid: false,
                error: 'Duration must be a valid number between 0 and 24 hours with up to 2 decimal places'
            };
        }

        const numValue = parseFloat(stringValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 24) {
            return { valid: false, error: 'Duration must be between 0 and 24 hours' };
        }

        return { valid: true, value: numValue };
    }

    static validateDate(value) {
        if (!value || typeof value !== 'string') {
            return { valid: false, error: 'Date is required and must be a string' };
        }

        if (!this.patterns.date.pattern.test(value)) {
            return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date' };
        }

        // Check if date is too far in the past or future
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const fiveYearsFromNow = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());

        if (date < oneYearAgo || date > fiveYearsFromNow) {
            return {
                valid: false,
                error: 'Date must be within one year ago and five years from now'
            };
        }

        return { valid: true, value: value };
    }

    static validateTag(value) {
        if (!value || typeof value !== 'string') {
            return { valid: false, error: 'Category/tag is required and must be a string' };
        }

        const trimmed = value.trim();
        if (!this.patterns.tag.pattern.test(trimmed)) {
            return {
                valid: false,
                error: 'Category/tag can only contain letters, spaces, and hyphens'
            };
        }

        return { valid: true, value: trimmed };
    }

    static validateRecord(record) {
        const errors = {};
        let hasErrors = false;

        // Validate title
        const titleResult = this.validateTitle(record.title);
        if (!titleResult.valid) {
            errors.title = titleResult.error;
            hasErrors = true;
        }

        // Validate duration
        const durationResult = this.validateDuration(record.duration);
        if (!durationResult.valid) {
            errors.duration = durationResult.error;
            hasErrors = true;
        }

        // Validate date
        const dateResult = this.validateDate(record.dueDate);
        if (!dateResult.valid) {
            errors.dueDate = dateResult.error;
            hasErrors = true;
        }

        // Validate tag
        const tagResult = this.validateTag(record.tag);
        if (!tagResult.valid) {
            errors.tag = tagResult.error;
            hasErrors = true;
        }

        if (hasErrors) {
            return { valid: false, errors };
        }

        return {
            valid: true,
            validatedRecord: {
                ...record,
                title: titleResult.value,
                duration: durationResult.value,
                dueDate: dateResult.value,
                tag: tagResult.value
            }
        };
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        // Remove potentially dangerous characters and normalize whitespace
        return input
            .replace(/[<>'"]/g, '') // Remove HTML/script injection attempts
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim();
    }

    static validateSettings(settings) {
        const errors = {};
        let hasErrors = false;

        // Validate weekly target
        if (settings.weeklyTarget !== undefined) {
            const weeklyTarget = parseFloat(settings.weeklyTarget);
            if (isNaN(weeklyTarget) || weeklyTarget < 0 || weeklyTarget > 168) {
                errors.weeklyTarget = 'Weekly target must be between 0 and 168 hours';
                hasErrors = true;
            }
        }

        // Validate daily target
        if (settings.dailyTarget !== undefined) {
            const dailyTarget = parseFloat(settings.dailyTarget);
            if (isNaN(dailyTarget) || dailyTarget < 0 || dailyTarget > 24) {
                errors.dailyTarget = 'Daily target must be between 0 and 24 hours';
                hasErrors = true;
            }
        }

        // Validate default tag
        if (settings.defaultTag !== undefined) {
            const tagResult = this.validateTag(settings.defaultTag);
            if (!tagResult.valid) {
                errors.defaultTag = tagResult.error;
                hasErrors = true;
            }
        }

        return hasErrors ? { valid: false, errors } : { valid: true };
    }

    // Test all patterns with sample data
    static runValidationTests() {
        const tests = [
            // Title tests
            { field: 'title', value: 'Valid Title', expected: true },
            { field: 'title', value: ' Leading Space', expected: false },
            { field: 'title', value: 'Trailing Space ', expected: false },
            { field: 'title', value: 'Double  Space', expected: false },
            { field: 'title', value: 'Same Same Word', expected: false }, // duplicate words

            // Duration tests
            { field: 'duration', value: '2.5', expected: true },
            { field: 'duration', value: '0', expected: true },
            { field: 'duration', value: '24', expected: true },
            { field: 'duration', value: '25', expected: false },
            { field: 'duration', value: '-1', expected: false },
            { field: 'duration', value: '2.555', expected: false }, // too many decimals

            // Date tests
            { field: 'date', value: '2024-10-15', expected: true },
            { field: 'date', value: '2024-13-01', expected: false }, // invalid month
            { field: 'date', value: '2024-02-30', expected: false }, // invalid day
            { field: 'date', value: '24-10-15', expected: false },   // wrong format

            // Tag tests
            { field: 'tag', value: 'Math', expected: true },
            { field: 'tag', value: 'Computer Science', expected: true },
            { field: 'tag', value: 'Web-Development', expected: true },
            { field: 'tag', value: 'Math123', expected: false }, // contains numbers
            { field: 'tag', value: 'Math!', expected: false },   // contains special chars

            // Advanced pattern tests
            { field: 'duplicateWords', value: 'This is is wrong', expected: true }, // pattern finds duplicate -> invalid
            { field: 'timeTokens', value: 'Meeting at 14:30', expected: true },
            { field: 'strongPassword', value: 'MyPass123!', expected: true },
            { field: 'strongPassword', value: 'weak', expected: false }
        ];

        const results = [];
        for (const test of tests) {
            let result;

            switch (test.field) {
                case 'title':
                    result = this.validateTitle(test.value);
                    break;
                case 'duration':
                    result = this.validateDuration(test.value);
                    break;
                case 'date':
                    result = this.validateDate(test.value);
                    break;
                case 'tag':
                    result = this.validateTag(test.value);
                    break;
                case 'duplicateWords':
                    // Here we expect the pattern to *find* duplicate words -> that means invalid input
                    result = { valid: !this.patterns.duplicateWords.pattern.test(test.value) };
                    break;
                case 'timeTokens':
                    result = { valid: this.patterns.timeTokens.test(test.value) };
                    break;
                case 'strongPassword':
                    result = { valid: this.patterns.strongPassword.pattern.test(test.value) };
                    break;
                default:
                    result = { valid: false };
            }

            results.push({
                field: test.field,
                value: test.value,
                expected: test.expected,
                actual: result.valid,
                passed: result.valid === test.expected,
                error: result.error || null
            });

            // Reset lastIndex for global patterns to avoid cross-test interference
            if (Validators.patterns.timeTokens.pattern.global) {
                Validators.patterns.timeTokens.pattern.lastIndex = 0;
            }
        }

        return results;
    }
}

export default Validators;
