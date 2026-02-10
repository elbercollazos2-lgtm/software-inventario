# GENOME: Semantic & Legibility Configuration

GENOME enforces meaning over syntax. This configuration ensures the code "speaks" its intent.

## Recommended ESLint Rules
```json
{
  "rules": {
    "no-magic-numbers": ["warn", { "ignoreArrayIndexes": true, "enforceForClassFields": true }],
    "func-names": ["error", "always"],
    "camelcase": ["error", { "properties": "always" }],
    "max-params": ["warn", 3],
    "max-lines-per-function": ["warn", { "max": 40, "skipBlankLines": true, "skipComments": true }],
    "id-length": ["error", { "min": 3, "exceptions": ["i", "j", "id"] }]
  }
}
```

## Recommended Prettier Rules
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## GENOME Checklist
- [ ] Are magic numbers replaced by named constants?
- [ ] Do functions start with a verb (e.g., `calculate`, `fetch`, `render`)?
- [ ] Is the data flow clear and declarative (map/filter/reduce)?
