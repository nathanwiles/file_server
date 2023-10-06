/**
 * Clients can connect to the server via TCP and send a request for a file (by filename)
 * The server looks for requested files locally and sends back the data
 */

const net = require("net");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const fileExtensionSelector = (fileName) => {
  const fileExtension = fileName.split(".")[1] || "unknown";
  const selector = (fileExtension) => {
    switch (fileExtension) {
      case "txt":
        return "/text";
      case "mp3":
        return "/audio/mp3";
      case "mp4":
        return "/video/mp4";
      case "jpg":
        return "/image/jpeg";
      case "png":
        return "/image/png";
      case "gif":
        return "/image/gif";
      default:
        return "/unsupported";
    }
  };
  const path = `./files${selector(fileExtension)}/${fileName}`;
  return path;
};

const onClientConnection = (socket) => {
  
  console.log(`\n::${socket.remotePort}::`);
  socket.on("data", (data) => {
    const fileName = data.toString();
    console.log(` Incoming request for file: ${fileName}`);

    const path = fileExtensionSelector(fileName);
    console.log(` File Exists: ${fs.existsSync(path) ? "Yes" : "No"}`);

    if (fs.existsSync(path)) {
      console.log(` Sending file: ${fileName}`);
      const contentType = path.split("/").pop().split(".")[1];
      const responseHeader = `HTTP/1.1 200 OK\r\nContent-Type: application/${contentType}\r\n\r\n`;
      socket.write(responseHeader);

      const fileData = fs.readFileSync(path);
      socket.write(fileData, "binary");
      socket.end();
    } else {
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    }
    socket.end();
  });

  socket.on("close", () => {
    console.log(`::${socket.remotePort}::`);
  });

  socket.on("error", (err) => {
    console.log(
      `::${socket.remotePort} \nConnection Error: ${err}`
    );
  });
};

const PORT = process.env.PORT || 8888;
const server = net.createServer(onClientConnection);

server.listen(PORT, () => {
  console.log(`\nServer listening on port ${PORT}`);
});
