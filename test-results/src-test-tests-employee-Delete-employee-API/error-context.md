# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: src\test\tests\employee.spec.js >> Delete employee API
- Location: src\test\tests\employee.spec.js:37:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 204
Received: 404
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | const BASE_URL = 'http://localhost:8082';
  4  | 
  5  | test('Create employee API', async ({ request }) => {
  6  | 
  7  |     const response = await request.post(`${BASE_URL}/api/employees`, {
  8  |         data: {
  9  |             name: 'Joh8n',
  10 |             email: 'joh8n@example.com',
  11 |             phone: '9870543210',
  12 |             department: 'IT'
  13 |         }
  14 |     });
  15 | 
  16 |     expect(response.status()).toBe(201);
  17 | 
  18 |     const employee = await response.json();
  19 | 
  20 |     expect(employee.name).toBe('John');
  21 |     expect(employee.email).toBe('john@example.com');
  22 | 
  23 |     console.log('Created Employee:', employee);
  24 | });
  25 | test('Get employees API', async ({ request }) => {
  26 | 
  27 |     const response = await request.get(`${BASE_URL}/api/employees`);
  28 | 
  29 |     expect(response.status()).toBe(200);
  30 | 
  31 |     const employees = await response.json();
  32 | 
  33 |     expect(Array.isArray(employees)).toBeTruthy();
  34 | 
  35 |     console.log('Employees:', employees);
  36 | });
  37 | test('Delete employee API', async ({ request }) => {
  38 | 
  39 |     const response = await request.delete(`${BASE_URL}/api/employees/1`);
  40 | 
> 41 |     expect(response.status()).toBe(204);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  42 | });
```