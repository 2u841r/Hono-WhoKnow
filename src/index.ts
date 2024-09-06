import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// app.get('/:username', (c) => {
//   const { username } = c.req.param()
//   return c.html(
//     html`<!doctype html>
//       <h1>Hello! ${username}!</h1>`
//   )
// })

app.get("/form", (c) => {
  const returnedValue = c.req.query("email") || "";

  return c.html(
    html`
      <html>
        <head>
          <style>
            h1 {
              color: blue;
              font-family: verdana;
              font-size: 300%;
            }
            p {
              color: red;
              font-family: courier;
              font-size: 160%;
            }
            body {
              background-color: grey;
            }
          </style>
          <title>Test Site</title>
        </head>
        <body>
          <h1>This is a heading</h1>
          <p>This is a paragraph.</p>
          <form method="POST" action="/form">
            <label for="email">
              Email: <input type="email" id="email" name="email" />
            </label>
            <button type="submit">Submit</button>
          </form>
          <p>Returned value from /p: ${returnedValue}</p>
        </body>
      </html>
    `
  );
});

app.post("/form", async (c) => {
  const body = await c.req.formData();
  const email = body.get("email");

  if (typeof email === "string" && email) {
    return c.redirect(`/form?email=${encodeURIComponent(email)}`);
  } else {
    return c.redirect(`/form?email=Invalid%20email`);
  }
});




app.get("/todo", (c) => {
  return c.html(
    html`
      <html>
        <head>
          <title>Todo Fetcher</title>
        </head>
        <body>
          <h1>Enter Todo ID</h1>
          <form method="POST" action="/todo">
            <label for="todoid">
              Todo ID: <input type="number" id="todoid" name="todoid" required />
            </label>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `
  );
});

app.post("/todo", async (c) => {
  const body = await c.req.formData();
  const todoid = body.get("todoid");

  if (!todoid) {
    return c.html("<p>Error: No Todo ID provided</p>", 400); 
  }

  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoid}`);
    if (!res.ok) {
      return c.html(`<p>Error: Todo not found (status ${res.status})</p>`);
    }
    
    const data = await res.json();
    return c.html(
      html`
        <html>
          <head>
            <title>Todo ${data.id}</title>
          </head>
          <body>
            <h1>Todo Details</h1>
            <ul>
              <li><strong>ID:</strong> ${data.id}</li>
              <li><strong>Title:</strong> ${data.title}</li>
              <li><strong>Completed:</strong> ${data.completed ? "Yes" : "No"}</li>
              <li><strong>User ID:</strong> ${data.userId}</li>
            </ul>
            <a href="/todo">Fetch another Todo</a>
          </body>
        </html>
      `
    );
  } catch (error) {
    return c.html("<p>Error: Failed to fetch data</p>", 500); 
  }
});



const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
