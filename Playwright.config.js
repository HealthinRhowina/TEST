const { defineConfig } =
    require("@playwright/test");

module.exports = defineConfig({

    testDir: "./src/test/tests",

    workers: 1,

    reporter: [
        ["list"],
        [
            "html",
            {
                outputFolder: "playwright-report",
                open: "never"
            }
        ]
    ],

    use: {
        baseURL:
            "http://localhost:8082"
    }
});