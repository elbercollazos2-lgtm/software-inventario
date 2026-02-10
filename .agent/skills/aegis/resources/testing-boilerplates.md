# AEGIS: Validation & Testing Shield

AEGIS does not trust code that hasn't been put through the scientific method.

## Unit Testing Boilerplate (Jest/Vitest)
```javascript
// feature.test.js
import { describe, it, expect } from 'vitest';
import { targetFunction } from './feature';

describe('Feature Test Room', () => {
  it('should handle standard input correctly', () => {
    const result = targetFunction(standardInput);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases (null, empty, extreme values)', () => {
    // AEGIS demands edge case testing
    expect(() => targetFunction(null)).toThrow();
  });
});
```

## Visual Snapshot Strategy
- Run `npm run test:visual` to capture UI state.
- Breakpoints: Mobile (375px), Tablet (768px), Desktop (1440px).

## Journey (E2E) Script Template
```javascript
// journey.spec.js
describe('User Journey: Buy Product', () => {
  it('completes the full flow without errors', () => {
    cy.visit('/');
    cy.get('#add-to-cart').click();
    cy.get('#checkout').click();
    cy.contains('Success').should('be.visible');
  });
});
```
