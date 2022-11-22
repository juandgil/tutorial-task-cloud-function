const express = require('express');
const { CloudTasksClient } = require('@google-cloud/tasks');

const records = [
  { name: "A" },
  { name: "B" },
];

async function enqueue(record) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: 'http://httpbin.org/post', // Añade tu URL aquí
      
      headers: {
        'content-type': 'application/json',
      },
      body: Buffer.from(JSON.stringify(record)).toString('base64'),
    }
  };
  // Es mejor hacer esto global e inicializar una vez
  const client = new CloudTasksClient();
  const parent = client.queuePath(process.env.GCLOUD_PROJECT, process.env.LOCATION, 'my-queue')
  const request = { parent, task };
  const [response] = await client.createTask(request);
  const { name } = response;
  console.log("Name", name);
}

async function myFunction(request, response) {
  for (const record of records) {
    await enqueue(record);
  }
  return response.status(200).send({
    text: "hola",
  });
}

function buildApp() {
  const app = express();
  app.use(require('body-parser').json());

  app.use(myFunction);
  return app;
}

exports.myFunction = buildApp();
