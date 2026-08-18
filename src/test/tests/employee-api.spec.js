const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8082';

test('Create employee API', async ({ request }) => {

    const response = await request.post(`${BASE_URL}/api/employees`, {
        data: {
            name: 'Joh8n',
            email: 'joh8n@example.com',
            phone: '9870543210',
            department: 'IT'
        }
    });

    expect(response.status()).toBe(201);

    const employee = await response.json();

    expect(employee.name).toBe('John');
    expect(employee.email).toBe('john@example.com');

    console.log('Created Employee:', employee);
});
test('Get employees API', async ({ request }) => {

    const response = await request.get(`${BASE_URL}/api/employees`);

    expect(response.status()).toBe(200);

    const employees = await response.json();

    expect(Array.isArray(employees)).toBeTruthy();

    console.log('Employees:', employees);
});
test('Delete employee API', async ({ request }) => {

    const response = await request.delete(`${BASE_URL}/api/employees/1`);

    expect(response.status()).toBe(204);
});