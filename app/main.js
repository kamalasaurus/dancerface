//TODO: in server.js summon a dominos pizza upon total success!
//TODO: block future success so the app doesn't go bankrupt 😅

const threshold = 20;

const w = 770;
//const w = 1960;
const h = 1080;

let video;
let dancing;

let poseNet;
let person = [];
let keyframes = [];
let currentPosition = 0;
const framePositions = [1, 2, 3, 4, 5]; // should be millisecond timestamps
// only push poses to data when > than millisecond timestamps, ++timelinePosition

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
    .then(json => keyframes = json)

})();

function setup() {
  //TODO: create video playback element with timeline and pose timestamps highlighted
  //TODO: video.onend fire reset
  //TODO: video.timestampupdate or whatever to set timeline comparions

  const container = document.createElement('div');
        container.style = 'vertical-align: top';
  document.body.appendChild(container);

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
    currentPosition = Math.floor(dancing.currentTime);
    Array.from(imageArray)
      .forEach((img) => {
        const id = +img.id.split('_').slice(-1).join();
        if (id < currentPosition + 0.25 && !img.classList.contains('green')) {
          img.src = `./poses/purple/${id}.png`;
          img.style.borderColor = 'magenta';
        } else if (!(id % 3)) {
          img.src = `./poses/green/${id}.png`;
          img.classList.add('green');
          img.style.borderColor = 'lightgreen';
        } else {
          img.src = `./poses/red/${id}.png`;
          img.style.borderColor = 'black';
        }
      });
  });

  container.appendChild(dancing);

  createCanvas(640, 480);
  video = createCapture(VIDEO)

  const canvas = document.querySelector('canvas');

  canvas.style = 'vertical-align: top; display: inline-block;';
  container.appendChild(canvas);

  poseNet = ml5.poseNet(
    video,
    'single',
    (results) => { person = results }
  )

  video.hide()

  //poseNet = ml5.poseNet(
    //dancing,
    //'single',
    //(results) => { person = results; }
  //);

  fill(255, 0, 0);
  stroke(255, 0, 0);
}

function draw() {
  image(video, 0, 0, 640, 480);
  //image(video, 0, 0, w, h);
  //image(dancing, 0, 0, w, h);
  //background(255, 255, 255);
  drawData();
}

function drawData() {
  //TODO: compare distance and angle from appendage keypoints to nose
  person.forEach((personData) => {

    personData.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2)
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    });

    personData.skeleton.forEach(([start, end]) => {
      line(start.position.x, start.position.y, end.position.x, end.position.y);
    });

    compareKeypoints(personData);

  });
}

function compareKeypoints(livePose) {
  let expectedPose = keyFrames[currentPosition]
  let pointsByKey = livePose.concat(expectedPose)
    .reduce((obj, point) => {
      const { part, position } = point;
      obj[part] = obj[part] ?
        obj[part].concat(position) :
        [ position ];
      return obj;
    }, {});

  return Object.keys(pointsByKey)
    .map(key => distance(pointsByKey[key]))
    .every(el => el < threshold);
}

function distance(pointarray) {
  const [
    {x: x1, y: y1},
    {x: x2 = x1, y: y2 = y1}
  ] = pointarray;
  return [rms(x1, x2), rms(y1, y2)]
}

function rms(arg1, arg2) {
  return Math.pow(Math.pow(arg1, 2) - Math.pow(arg2, 2), 0.5);
}

function reset() {
  data = [];
  timelinePosition = 0;
}
