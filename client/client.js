/* send connect to server via TCP and send request for file from process.argv[2] */

const fileToQuery = process.argv[2] || "test.txt";
const net = require("net");
const fs = require("fs");
// const dotenv = require("dotenv");
// dotenv.config();
const port = process.env.PORT || 8888;

const client = new net.Socket();

client.connect(port, () => {
  console.log(`Connected to server on port: ${port}`);
  console.log(`Sending request for file: ${fileToQuery}`);
  client.write(`${fileToQuery}`);
});

client.on("data", (data) => {
  console.log(`Recieved data from server: saving to './requested-files/${fileToQuery}`);
  fs.writeFileSync(`./requested-files/${fileToQuery}`, Buffer.from(data));
});

client.on("error", (err) => {
  console.log(`Connection error: ${err}`);
  client.end();
});

client.on("close", () => {
  console.log("Connection closed");
});
