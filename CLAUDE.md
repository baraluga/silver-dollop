# Claude Code Configuration

## Development Guidelines

- Follow existing code patterns and conventions in the codebase
- Use consistent formatting and indentation throughout the project
- Code should be self-explanatory without comments

## Code Quality

- Run linting and type checking before committing changes
- Write tests for new functionality when applicable
- Remove unused imports and dead code
- Handle errors gracefully with appropriate error messages
- Don't ignore caught exceptions
- Use exceptions rather than return codes for error handling

## Commit Practices

- Use conventional commit format: `type(scope): description`
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep commit messages concise but descriptive
- Make atomic commits that represent single logical changes
- Practice micro commits: Every smallest logical change, commit. Worst case, before moving to a different file, make sure to commit changes. Avoid over-coding without committing for a more manageable git history.

## Best Practices

- Avoid committing secrets, API keys, or sensitive information
- Prefer composition over inheritance
- Apply the DRY (Don't Repeat Yourself) principle
- Follow the Boy Scout Rule: leave code cleaner than you found it
- Practice Dependency Inversion: depend on abstractions, not concretions
- Apply Command Query Separation: functions should either do something or answer something, not both

## Personal Coding Rules

### Size Constraints
- Keep files under 200 lines of code (LOC)
- Maximum 20 lines of code per function/method
- Maximum 2 parameters/arguments per function/method
- Avoid flag arguments (boolean parameters often violate SRP)

### Complexity Management
- Maximum cyclomatic complexity of 2 (use strategy/factory/template patterns to reduce complexity)
- Practice Single Responsibility Principle (SRP): functions should do one thing only

### Language Features
- Always use types when available in the programming language
- Practice maximum encapsulation when access modifiers are available (always private unless necessary)

### Naming
- Use meaningful names that avoid abbreviations and mental mapping
- Names should reveal intent and be searchable

### Testing
- Follow F.I.R.S.T. principles: Fast, Independent, Repeatable, Self-validating, Timely
- Use only 1 assertion per test case; avoid multiple assertions
- If multiple assertions are needed, group them logically in separate test cases
- Test behavior, not implementation

#### Test-Driven Development (TDD)
- **IMPORTANT: Only practice TDD if a test file is available for a given file**
- **Do not create test files unless told otherwise**
- Write test for expected behavior first
- Then write the best solution to make it pass
- Focus on 1 behavior at a time
- Don't be strict on Red-Green-Refactor as it may encourage intentionally sub-standard solutions