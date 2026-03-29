const { saveToGitHub } = require("./client/js/githubSave");

saveToGitHub({
    test: true,
    message: "Testing save function",
    time: Date.now()
});