/**
 * Clients can connect to the server via TCP and send a request for a file (by filename)
 * The server looks for requested files locally and sends back the data
 */

const net = require("net");
const fs = require("fs");
// const dotenv = require("dotenv");
// dotenv.config();

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
  console.log(`${socket.remoteAddress}:${socket.remotePort} connected`);
  socket.on("data", (data) => {
    console.log(`Incoming request for file: ${data}`);

    const path = fileExtensionSelector(data.toString());
    console.log(`Does file exist? ${fs.existsSync(path) ? "Yes" : "No"}`);

    if (fs.existsSync(path)) {
      console.log(`Sending file: ${data}`);
      socket.write(fs.readFileSync(path, "utf8"));
    } else {
      socket.write(`path ${path} does not exist`);
    }
    socket.end();
  });

  socket.on("close", () => {
    console.log(`${socket.remoteAddress}:${socket.remotePort} disconnected`);
  });

  socket.on("error", (err) => {
    console.log(
      `${socket.remoteAddress}:${sock.remotePort} Connection Error: ${err}`
    );
  });
};

const PORT = process.env.PORT || 8888;
const server = net.createServer(onClientConnection);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
