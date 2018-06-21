const {copy, concat, compile} = require('./build.js');
const pizzapi = require('dominos');
const StaticServer = require('static-server');

// build app
const scripts = [
  './node_modules/p5/lib/p5.min.js',
  './node_modules/p5/lib/addons/p5.dom.min.js',
  './node_modules/ml5/dist/ml5.min.js'
]
.map(copy)
.reduce(concat, '');

compile(scripts); // build upon launch

// setup dominos

//let address = new pizzapi.Address('721 Broadway, New York, NY 10003');
//let customer = new pizzapi.Customer({
  //address,
  //firstName: 'NYU',
  //lastName: 'Student',
  //phone: 'xxx-xxx-xxxx',
  //email: 'salami@sandwich.com'
//});
//TODO: add secrets.json for name and email creds

//let myStore;

//pizzapi.Util.findNearbyStores(
  //'721 Broadway, New York, NY 10003',
  //'Delivery',
  //(storeData) => {
    //const { result: { Stores: [{ StoreID }] }} = storeData;
    //myStore = new pizzapi.Store();
    //myStore.ID = StoreID;
  //}
//);

//get menu
//get code for cheese pizza
//make order for cheese pizza


// run server
const server = new StaticServer({
  rootPath: './app',
  port: 1337
});

server.start(() => {
  console.log('server listening to', server.port);
});

