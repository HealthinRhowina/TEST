const { test, expect } = require("@playwright/test");

const {
    saveResult,
    resetReport
} = require("./api-report");

const BASE_URL = "http://localhost:8082";


test.beforeAll(() => {
    resetReport();
});


test("Create employee API", async ({ request }) => {

    const start = Date.now();

    const response = await request.post(
        `${BASE_URL}/api/employees`,
        {
            data: {
                firstName: "John",
                lastName: "David",
                email: `john${Date.now()}@example.com`,
                phone: "9876543210",
                department: "IT"
            }
        }
    );

    const time =
        (Date.now() - start) / 1000;

    saveResult({
        endpoint: "Create employee",
        method: "POST",
        path: "/api/employees",
        status: response.status(),
        success: response.status() === 200,
        time
    });

    expect(response.status()).toBe(200);

    const employee =
        await response.json();

    expect(employee.firstName)
        .toBe("John");
});


test("Get employees API", async ({ request }) => {

    const start = Date.now();

    const response =
        await request.get(
            `${BASE_URL}/api/employees`
        );

    const time =
        (Date.now() - start) / 1000;

    saveResult({
        endpoint: "Get employees",
        method: "GET",
        path: "/api/employees",
        status: response.status(),
        success: response.status() === 200,
        time
    });

    expect(response.status()).toBe(200);

    const employees =
        await response.json();

    expect(
        Array.isArray(employees)
    ).toBeTruthy();
});


test("Delete employee API", async ({ request }) => {

    // Create employee first
    const createResponse =
        await request.post(
            `${BASE_URL}/api/employees`,
            {
                data: {
                    firstName: "Delete",
                    lastName: "Employee",
                    email:
                        `delete${Date.now()}@example.com`,
                    phone: "9876543210",
                    department: "IT"
                }
            }
        );

    const employee =
        await createResponse.json();


    // Measure DELETE API only
    const start = Date.now();

    const response =
        await request.delete(
            `${BASE_URL}/api/employees/${employee.id}`
        );

    const time =
        (Date.now() - start) / 1000;

    saveResult({
        endpoint: "Delete employee",
        method: "DELETE",
        path: `/api/employees/${employee.id}`,
        status: response.status(),
        success: response.status() === 204,
        time
    });

    expect(response.status())
        .toBe(204);
});