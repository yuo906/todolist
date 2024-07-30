const http = require("node:http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errorHandle");
const todos = [];

const requestListener = (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };

  let body = "";

  // 傳送封包
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        "status": "success",
        "data": todos,
      })
    );
  } else if (req.url == "/todos" && req.method == "POST") {
    // 組成封包
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4(),
          };

          todos.push(todo);
          res.writeHead(200, headers);
          res.end(
            JSON.stringify({
              "status": "success",
              "data": todos,
            })
          );
        } else {
          errHandle(res);
        }
      } catch (error) {
        errHandle(res);
      }
    });
  } else if (req.url == "/todos" && req.method == "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        "status": "success",
        "data": todos,
      })
    );
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    const id = req.url.split('/').pop();
    const index = todos.findIndex(el=> el.id == id);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.end(
        JSON.stringify({
          "status": "success",
          "data": todos,
        })
      );
    } else {
      errHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    req.on("end", () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex((el)=> el.id == id)

        if (todo !== undefined && index !== -1) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.end(
            JSON.stringify({
              "status": "success",
              "data": todos,
            })
          );
        } else {
          errHandle(res);
        }
      } catch (error) {
        errHandle(res);
      }
    });
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        "status": "false",
        "data": "無此頁面",
      })
    );
    res.end();
  }
};

// Create a local server to receive data from
const server = http.createServer(requestListener);

server.listen(8000);
