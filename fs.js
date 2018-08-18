
var config = require("./config.json");

const dfs = require('dropbox-fs')({
    apiKey: config.access_token
});

console.log("access_token is : " + config.access_token);
 
dfs.readdir('/', (err, result) => {
    console.log(result); // Array of files and folders
});

dfs.readFile('/example.txt', (err, result) => {
    console.log(result.toString('utf8'));
});
