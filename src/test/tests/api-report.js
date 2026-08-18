const fs = require("fs");
const path = require("path");

const reportDir = path.join(process.cwd(), "reports");
const jsonFile = path.join(reportDir, "api-performance.json");
const htmlFile = path.join(reportDir, "api-performance.html");

function resetReport() {

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(jsonFile, JSON.stringify([], null, 2));
}

function saveResult(result) {

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    let results = [];

    if (fs.existsSync(jsonFile)) {
        results = JSON.parse(
            fs.readFileSync(jsonFile, "utf8")
        );
    }

    results.push({
        index: results.length + 1,
        endpoint: result.endpoint,
        method: result.method,
        path: result.path,
        status: result.status,
        success: result.success ? "SUCCESS" : "FAIL",
        time: Number(result.time.toFixed(3))
    });

    fs.writeFileSync(
        jsonFile,
        JSON.stringify(results, null, 4)
    );

    generateHTML(results);
}

function generateHTML(results) {

    const totalTime = results.reduce(
        (sum, result) => sum + result.time,
        0
    );

    const averageTime =
        results.length > 0
            ? totalTime / results.length
            : 0;

    const fastest =
        results.length > 0
            ? Math.min(...results.map(r => r.time))
            : 0;

    const slowest =
        results.length > 0
            ? Math.max(...results.map(r => r.time))
            : 0;

    const passCount =
        results.filter(r => r.success === "SUCCESS").length;

    const failCount =
        results.filter(r => r.success === "FAIL").length;

    const rows = results.map(result => {

        const rowClass =
            result.success === "SUCCESS"
                ? "success-row"
                : "fail-row";

        const statusClass =
            result.success === "SUCCESS"
                ? "success-text"
                : "fail-text";

        const methodClass =
            result.method.toLowerCase();

        return `
            <tr class="${rowClass}">
                <td>${result.index}</td>

                <td>${result.endpoint}</td>

                <td>
                    <span class="method ${methodClass}">
                        ${result.method}
                    </span>
                </td>

                <td>${result.path}</td>

                <td>${result.status}</td>

                <td class="${statusClass}">
                    ${result.success}
                </td>

                <td>${result.time.toFixed(3)} s</td>
            </tr>
        `;
    }).join("");

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>API Performance Report</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 30px;
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    color: #222;
}

.container {
    max-width: 1400px;
    margin: auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 3px 15px rgba(0,0,0,0.10);
}

h1 {
    margin: 0;
    font-size: 28px;
}

.subtitle {
    margin-top: 8px;
    color: #666;
    font-size: 14px;
}

.summary {
    display: flex;
    gap: 15px;
    margin: 25px 0;
    flex-wrap: wrap;
}

.card {
    flex: 1;
    min-width: 150px;
    background: #f8fafc;
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
}

.card-title {
    color: #666;
    font-size: 13px;
}

.card-value {
    font-size: 22px;
    font-weight: bold;
    margin-top: 6px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th {
    background: #171717;
    color: white;
    padding: 12px;
    text-align: left;
    font-size: 13px;
}

td {
    padding: 11px;
    border-bottom: 1px solid #ddd;
    font-size: 13px;
}

.success-row {
    background: #ffffff;
}

.fail-row {
    background: #ffeaea;
}

.success-text {
    color: #16803a;
    font-weight: bold;
}

.fail-text {
    color: #dc2626;
    font-weight: bold;
}

.method {
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-size: 11px;
    font-weight: bold;
}

.get {
    background: #16a34a;
}

.post {
    background: #2563eb;
}

.put {
    background: #f59e0b;
}

.delete {
    background: #dc2626;
}

.footer {
    margin-top: 25px;
    font-weight: bold;
}

</style>

</head>

<body>

<div class="container">

<h1>API Performance Report</h1>

<div class="subtitle">
    Base URL: http://localhost:8082
    |
    Generated: ${new Date().toLocaleString()}
</div>

<div class="summary">

    <div class="card">
        <div class="card-title">Total APIs</div>
        <div class="card-value">${results.length}</div>
    </div>

    <div class="card">
        <div class="card-title">Passed</div>
        <div class="card-value">${passCount}</div>
    </div>

    <div class="card">
        <div class="card-title">Failed</div>
        <div class="card-value">${failCount}</div>
    </div>

    <div class="card">
        <div class="card-title">Average Time</div>
        <div class="card-value">${averageTime.toFixed(3)} s</div>
    </div>

</div>

<table>

<thead>

<tr>
    <th>Index</th>
    <th>Endpoint</th>
    <th>Method</th>
    <th>Path</th>
    <th>Response Status</th>
    <th>Success/Fail</th>
    <th>Time (s)</th>
</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

<div class="footer">

Total time across all endpoints:
${totalTime.toFixed(3)} s

<br>

Average response time:
${averageTime.toFixed(3)} s

<br>

Fastest API:
${fastest.toFixed(3)} s

<br>

Slowest API:
${slowest.toFixed(3)} s

</div>

</div>

</body>

</html>
`;

    fs.writeFileSync(
        htmlFile,
        html,
        "utf8"
    );
}

module.exports = {
    saveResult,
    resetReport
};