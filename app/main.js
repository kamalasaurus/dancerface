//TODO:  video of dancer
//TODO:  create video playback element with timeline and pose timestamps highlighted
//TODO:  freeze frames of important poses
//TODO:  posenet initialization
//TODO:  run posenet on important poses
//TODO:  create array of said pose data
//TODO:  attach posenet to capture video
//TODO:  RMS difference between video feed @time intervals and freeze frames
//TODO:  color key for success and failure at each timeline node
//TODO:  in server.js summon a dominos pizza upon total success!
//TODO:  block future success so the app doesn't go bankrupt 😅

let w = 620;
let h = 480;
let video;
let poseNet;
let data = [];

function setup() {
  createCanvas(w, h);
  video = createCapture(VIDEO);
  poseNet = ml5.poseNet(
    video,
    'multiple',
    (results) => { data = results; }
  );
  video.hide();
  fill(255, 0, 0);
  stroke(255, 0, 0);
}

function draw() {
  image(video, 0, 0, w, h);
  drawData();
}

function drawData() {
  data.forEach((datum) => {

    datum.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2)
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    });

    datum.skeleton.forEach(([start, end]) => {
      line(start.position.x, start.position.y, end.position.x, end.position.y);
    });

  });
}

