const superSecretPassword = 'nohack123'

const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs');
const spawn = require("child_process").spawn;

const app = express();
const server = http.Server(app);

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('html/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.resolve('html/password.html'));
});

app.post('/admin', (req, res) => {
  if(req.body.pass == superSecretPassword) res.sendFile(path.resolve('html/admin.html'));
  else res.sendFile(path.resolve('html/password.html'));
});

app.post('/newtest', (req, res) => {
  fs.writeFile(`python/tests/${req.body.name}`, req.body.content, err => {
    if(err) console.log(err);
    else console.log(`created file ${req.body.name}`);
  });
});

app.post('/evaltest', (req, res) => {
  const testName = req.body.name;
  const userCode = req.body.code;

  fs.writeFile('python/userCode.py', userCode, err => {
    if(err) console.log(err);
    else console.log('updated userCode');
  });

  const pythonProcess = spawn('python', ["python/runTest.py", testName]);


  pythonProcess.stdout.on('data', data => {
    data = data.toString('utf8');
    console.log(data);
    res.send(data);
  });
});

app.use(express.static('static'));

let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server up on port ${port}`);
});
