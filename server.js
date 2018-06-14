const {copy, concat, compile} = require('./build.js');

const StaticServer = require('static-server');


const scripts = [
  './node_modules/p5/lib/p5.min.js',
  './node_modules/p5/lib/addons/p5.dom.min.js',
  './node_modules/@tensorflow/tfjs/dist/tf.min.js',
  './node_modules/@tensorflow-models/posenet/dist/posenet.min.js'
]
.map(copy)
.reduce(concat, '');

compile(scripts); // build upon launch


const server = new StaticServer({
  rootPath: './app',
  port: 1337
});

server.start(() => {
  console.log('server listening to', server.port);
});

