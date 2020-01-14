let video;
let contourGraphics;
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;
let classResult;
let imagesDict = {
  '000': 'background.png',
  '001': 'bird.png',
  '002': 'desert.png',
  '003': 'eat.png',
  '004': 'prince.png',
  '005': 'kill.png',
  '006': 'plant.png',
  '007': 'antidote.png',
  '008': 'stones.png',
  '009': 'stranger.png',
  '010': 'pluton.png',
  '011': 'fair.png',
  '012': 'cup.png',
  '013': 'lake.png',
  '014': 'wolf.png',
  '015': 'woods.png',
}

let videoPadding = 20
let videoScale = 0.75

function preload() {
  // taille de l'image 1748 x 2480 pixel 
  let maxWidth = windowWidth / 1.5
  let maxHeight = windowHeight / 1.5
for (let [key, value] of Object.entries(imagesDict)) {
    loadImage('images/' + value, img => {
      let { width, height } = img
      let scale = Math.min(maxWidth / width, maxHeight / height)
      img.resize(scale * width, scale * height)
      imagesDict[key] = img
    });
  }
}

function setup() {  
  featureExtractor = ml5.featureExtractor('MobileNet', loadMyKNN)
  video = createCapture(VIDEO)
  video.size(640, 480) // resolution
  video.hide()  
  createCanvas(windowWidth, windowHeight)

  contourGraphics = createGraphics(video.width, video.height)
  contourGraphics.id("video-canvas")
  contourGraphics.hide()
  // For some reason this is needed?
  contourGraphics.style("width", `${video.width * videoScale}`)
  contourGraphics.style("height", `${video.height * videoScale}`)
}

function draw() {
  clear()
  push()
  tint(255, 255, 255, 127)
  image(video, videoPadding, videoPadding, video.width * videoScale, video.height * videoScale)
  filter(GRAY)
  pop()
  blendMode(MULTIPLY)
  adaptiveThreshold(video, contourGraphics)
  image(contourGraphics, videoPadding, videoPadding, video.width * videoScale, video.height * videoScale)
  
  let img = imagesDict[classResult];
  if (img) {
    image(img, 600, 0);
  }
}

function keyPressed() {
  if (keyCode === 32) {
    let img = imagesDict[classResult];
    if (img) {
      let image = img.canvas.toDataURL()
      let contour = contourGraphics.canvas.toDataURL()
      console.log('PNGs send to print', image, contour)
    }
  }
}

function classify() {
  const numLabels = knnClassifier.getNumLabels();    
  const features = featureExtractor.infer(video);  
  knnClassifier.classify(features, gotResults);   
}

function gotResults(err, result) {
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {    
    if (result.label) {      
      classResult = result.label            
    }
  }
  classify();
}

function loadMyKNN() {
  knnClassifier.load('./model.json', classify);
  console.log("model loaded")
}

function adaptiveThreshold(video, graphics) {
  try {
    // Draw current video frame to canvas.
    // p5 does funny things with graphics size and HiDPI, fix it the ugly way:
    graphics.canvas.width = video.width
    graphics.canvas.height = video.height
    graphics.image(video, 0, 0)
    let src = cv.imread(graphics.canvas)
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
    // cv.threshold(src, src, 128, 255, cv.THRESH_BINARY_INV)
    cv.adaptiveThreshold(src, src, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, -3)
    cv.imshow(graphics.canvas, src)
    src.delete()
  }
  catch (error) {
    console.error(error)
  }
}

