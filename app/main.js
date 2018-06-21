//TODO: video of dancer
//TODO: freeze frames of important poses
//TODO: run posenet on important poses
//TODO: create array of said pose data
//TODO: in server.js summon a dominos pizza upon total success!
//TODO: block future success so the app doesn't go bankrupt 😅

const threshold = 20;

const w = 620;
const h = 480;
let video;
let dancing;

let poseNet;
let person = [];
let keyframes = []; // should just be JSON array of keypoints that are precomputed for poses in timestamp order!
let currentPosition = 0;
const framePositions = [1, 2, 3, 4, 5]; // should be millisecond timestamps
// only push poses to data when > than millisecond timestamps, ++timelinePosition

function setup() {
  //TODO: create video playback element with timeline and pose timestamps highlighted
  //TODO: video.onend fire reset
  //TODO: video.timestampupdate or whatever to set timeline comparions

  createCanvas(w, h);
  //video = createCapture(VIDEO)

  //dancing = createVideo('./assets/flossing.mp4', (vid) => { vid.play() })

  dancing = createVideo('https://media.giphy.com/media/xUA7aXRRUlmqhoG7q8/giphy.mp4', () => { dancing.play() });

  //poseNet = ml5.poseNet(
    //video,
    //'single',
    //(results) => { data = results }
  //)

  //video.hide()

  poseNet = ml5.poseNet(
    dancing,
    'single',
    (results) => { person = results }
  );
  dancing.hide();

  fill(255, 0, 0);
  stroke(255, 0, 0);
}

function draw() {
  //image(video, 0, 0, w, h);
  image(dancing, 0, 0, dancing.width, dancing.height);
  drawData();
  //TODO: RMS difference between video feed @time intervals and freeze frames
  //reset if too different
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

    //TODO: should actually compare skeleton, not keypoints
    //HMM -- that won't quite work either; need to group by coords
    //compareKeypoints(datum.pose.keypoints)

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
  data = []
  timelinePosition = 0
  // restart video of dancer
}
