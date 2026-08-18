const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8082';

test('Create employee API', async ({ request }) => {

    const response = await request.post(`${BASE_URL}/api/employees`, {
        data: {
            firstName: 'John',
            lastName: 'David',
            email: `john${Date.now()}@example.com`,
            phone: '9876543210',
            department: 'IT'
        }
    });

    // Your controller currently returns 200
    expect(response.status()).toBe(200);

    const employee = await response.json();

    expect(employee).toBeTruthy();
    expect(employee.firstName).toBe('John');
    expect(employee.lastName).toBe('David');
});


test('Get employees API', async ({ request }) => {

    const response = await request.get(`${BASE_URL}/api/employees`);

    expect(response.status()).toBe(200);

    const employees = await response.json();

    expect(Array.isArray(employees)).toBeTruthy();

    console.log('Employees:', employees);
});


test('Delete employee API', async ({ request }) => {

    // First create an employee
    const createResponse = await request.post(`${BASE_URL}/api/employees`, {
        data: {
            firstName: 'Delete',
            lastName: 'Test',
            email: `delete${Date.now()}@example.com`,
            phone: '9876543210',
            department: 'IT'
        }
    });

    expect(createResponse.status()).toBe(200);

    const employee = await createResponse.json();

    console.log('Created employee ID:', employee.id);

    // Delete the employee that was just created
    const deleteResponse = await request.delete(
        `${BASE_URL}/api/employees/${employee.id}`
    );

    expect(deleteResponse.status()).toBe(204);
});