//TODO: video of dancer
//TODO: freeze frames of important poses
//TODO: run posenet on important poses
//TODO: create array of said pose data
//TODO: color key for success and failure at each timeline node
//TODO: in server.js summon a dominos pizza upon total success!
//TODO: block future success so the app doesn't go bankrupt 😅

const w = 620
const h = 480
let video
let dancing

let poseNet
let data = []
let keyframes = [] // should just be a JSON array that's requested
let timelinePosition = 0
const framePositions = [1, 2, 3, 4, 5] // should be millisecond timestamps
// only push poses to data when > than millisecond timestamps, ++timelinePosition

function setup() {
  //TODO: create video playback element with timeline and pose timestamps highlighted
  //TODO: video.onend fire reset
  //TODO: video.timestampupdate or whatever to set timeline comparions

  createCanvas(w, h)
  video = createCapture(VIDEO)

  dancing = createVideo('assets/flossing.mp4', (vid) => { vid.play() })

  poseNet = ml5.poseNet(
    video,
    'multiple',
    (results) => { data = results }
  )
  video.hide()
  fill(255, 0, 0)
  stroke(255, 0, 0)
}

function draw() {
  image(video, 0, 0, w, h)
  drawData()
  //TODO: RMS difference between video feed @time intervals and freeze frames
  //reset if too different
}

function drawData() {
  data.forEach((datum) => {

    datum.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2)
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10)
    });

    datum.skeleton.forEach(([start, end]) => {
      line(start.position.x, start.position.y, end.position.x, end.position.y)
    });

  });
}

function timeline() {

}

function reset() {
  data = []
  timelinePosition = 0
  // restart video of dancer
}
