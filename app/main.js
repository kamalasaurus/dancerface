//TODO: in server.js summon a dominos pizza upon total success!
//TODO: block future success so the app doesn't go bankrupt 😅

// this kind of intermittent global variable call out architecture is
// regrettable. -_____-;
const w = 770;
const h = 1080;

let video;
let dancing;

let poseNet;
let person = [];
let keyFrames = [];
let thresholds = {};
let currentPosition = 0;

let hasSummonedPizza = false;

let imageArray = document.getElementsByTagName('img');

(function() {
  const imageContainer = document.createElement('div');
        imageContainer.style = 'margin-bottom: 20px; padding: 4px;';
  document.body.appendChild(imageContainer);

  Array
    .from({length: 19}, (e, i) => `./poses/red/${i}.png`)
    .forEach((route, i) => {
      const img = document.createElement('img');
            img.src = route;
            img.id = `image_${i}`;
            img.style = 'width: 150px; height: 135; display: inline-block; border: solid 2px black; margin: 4px;';
      imageContainer.appendChild(img);
    });

  fetch('./poses/poses.json')
    .then(data => data.json())
    .then(json => keyFrames = json);

  fetch('./poses/thresholds.json')
    .then(data => data.json())
    .then(json => thresholds = json);

})();

function setup() {

  dancing = document.createElement('video');
  dancing.setAttribute('muted', true);
  dancing.setAttribute('autoplay', true);
  dancing.setAttribute('loop', true);
  dancing.setAttribute('width', w);
  dancing.setAttribute('height', h);
  dancing.style = 'display: inline-block;';
  dancing.id = 'dancing';
  dancing.src = './assets/dancing_crop.mp4';

  dancing.addEventListener('click', () => {
    if (dancing.paused) dancing.play();
    else dancing.pause();
  });

  dancing.addEventListener('timeupdate', (event) => {
    let previousPosition = currentPosition;
    currentPosition = Math.floor(dancing.currentTime + 0.25); //spaghetti!
    if (previousPosition > currentPosition) reset();


    // update image states
    Array.from(imageArray)
      .forEach((img) => {
        const id = +img.id.split('_').slice(-1).join();
        if (id < currentPosition && !img.classList.contains('green')) {
          img.src = `./poses/purple/${id}.png`;
          img.style.borderColor = 'magenta';
        } else if (img.classList.contains('green')) {
          img.src = `./poses/green/${id}.png`;
          img.style.borderColor = 'lightgreen';
        } else {
          img.src = `./poses/red/${id}.png`;
          img.style.borderColor = 'black';
        }
      });


    // update victory condition
    const victory = Array.from(imageArray)
      .reduce(((sum, img) => img.classList.contains('green') ? sum + 1 : sum), 0);

    if (victory > 15 && !hasSummonedPizza && currentPosition === 18) {
      fetch('./success');
      hasSummonedPizza = true;
      setTimeout(() => { hasSummonedPizza = false; }, 30000);
      reset();
    }

  });

  document.body.appendChild(dancing);

  createCanvas(640, 480);
  video = createCapture(VIDEO)

  const canvas = document.querySelector('canvas');

  canvas.style = 'vertical-align: top; display: inline-block;';
  document.body.appendChild(canvas);

  poseNet = ml5.poseNet(
    video,
    'single',
    (results) => { person = results }
  )

  video.hide()

  fill(255, 0, 0);
  stroke(255, 0, 0);
}

function draw() {
  image(video, 0, 0, 640, 480);
  drawData();
}

function drawData() {
  person.forEach((personData) => {

    personData.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2)
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    });

    personData.skeleton.forEach(([start, end]) => {
      line(start.position.x, start.position.y, end.position.x, end.position.y);
    });

    compareKeypoints(personData.pose.keypoints);

  });
}

function compareKeypoints(livePoints) {
  const livePose = collectPointDistancesAndAngles(livePoints);
  const expectedPose = collectPointDistancesAndAngles(keyFrames[currentPosition]);

  const comparisonGroups = livePose.concat(expectedPose)
    .reduce(groupByKey, {});

  const matched = Object.keys(comparisonGroups)
    .map((key) => {
      const threshold = thresholds[key];
      const normalized = normalize(comparisonGroups[key]);
      //console.log(threshold);
      //console.log(normalized);
      return normalized < threshold;
    })
    .every(Boolean);

  //should be matched!, just true for testing
  if (true) setMatched(currentPosition);
}

function setMatched(position) {
  document.getElementById(`image_${position}`)
    .classList
    .add('green');
}

// set sum distance between distance and angle to 1, basic normalization
function normalize([{distance: d1, angle: a1}, {distance: d2, angle: a2}]) {
  return 0.5 * ((d1 - d2) / Math.max(d1, d2)) + 0.5 * ((a1 - a2) / Math.max(a1, a2));
}

function collectPointDistancesAndAngles(points) {
  const byKey = points
    .reduce(pointsByKey, {});

  // bind the nose to the first variable as point of reference for distance measure
  // since the nose is constant for all calculations; can iterate freely w/ curried
  // function ... it's probably unnecessary optimization for this kind of thing though
  const calculate = distanceAndAngleFromNose.bind(null, byKey['nose'] || {x: 0, y: 0});

  return Object.keys(byKey)
    .map(key => calculate(byKey[key], key));
}

function groupByKey(obj, posObj) {
  const key = Object.keys(posObj)[0];
  const el = posObj[key];
  obj[key] = obj[key] ?
    obj[key].concat(el) :
    [ el ];
  return obj;
}

function pointsByKey(obj, point) {
  const { part, position } = point;
  obj[part] = obj[part] ?
    obj[part].concat(position) :
    [ position ];
  return obj;
};

function distanceAndAngleFromNose(
  [{x: nose_x, y: nose_y}],
  [{x: point_x, y: point_y}],
  name) {

  const x_comp = point_x - nose_x;
  const y_comp = point_y - nose_y;

  const d = distance(x_comp, y_comp);
  const a = angle(x_comp, y_comp);

  return {[name]: {distance: d, angle: a}};
}

function angle(x_comp, y_comp) {
  return Math.atan2(y_comp, x_comp);
}

function distance(x_comp, y_comp) {
  return Math.pow((Math.pow(x_comp, 2) + Math.pow(y_comp, 2)), 0.5);
}

function reset() {
  Array.from(imageArray)
    .forEach((img) => {
      const id = +img.id.split('_').slice(-1).join();
      img.classList.remove('green');
      img.src = `./poses/red/${id}.png`;
    });
}

