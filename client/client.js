/* send connect to server via TCP and send request for file from process.argv[2] */

const net = require("net");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const fileToQuery = process.argv[2] || "test.txt";
const port = process.env.PORT || 8888;

const client = new net.Socket();
console.log(`\nFile request:`);
client.connect(port, () => {
  console.log(`- Connected to server:`);
  console.log(`- Sending request for ${fileToQuery}`);
  client.write(`${fileToQuery}`);
});

client.on("data", (data) => {
  if (data.toString().startsWith("HTTP/1.1 200 OK")) {
    const contentType = data
      .toString()
      .split("Content-Type: ")[1]
      .split("\r\n")[0]
      .split("/")[1];
    let receivedData = Buffer.from('');

    client.on("data", (chunk) => {
      receivedData = Buffer.concat([receivedData, chunk]);
    });
    client.on("end", () => {
      console.log(
        `- Recieved data from server: saving to: './requested-files/${fileToQuery}`
      );
      fs.writeFileSync(
        `./requested-files/${fileToQuery}`,
        receivedData,
        "binary"
      );
    });
    client.end();
  }
  if (data.toString().startsWith("HTTP/1.1 404 Not Found")) {
    console.log(`- File not found on server`);
    client.end();
  }
});

client.on("error", (err) => {
  console.log(`- Connection error: ${err}`);
  client.end();
});

client.on("close", () => {
  console.log("- Connection closed");
});
