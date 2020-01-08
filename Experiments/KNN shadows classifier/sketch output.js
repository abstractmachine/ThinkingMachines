let video;
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;
let classResult;
let imagesDict = {
  '000': 'background.jpg',
  '001': 'birds.jpg',
  '002': 'grass.jpg',
  '003': 'mountain.jpg',
  '004': 'tree.jpg',
  '005': 'wolf.jpg',

}

function preload() {
  for (let [key, value] of Object.entries(imagesDict)) {
    let img = loadImage('images/' + value);
    imagesDict[key] = img;
  }
}

function setup() {  
  featureExtractor = ml5.featureExtractor('MobileNet', loadMyKNN);  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide()  
  createCanvas(770,1100)
}

function draw() {
  image(video,-200,-20,1200,1200);
  tint(255, 127);
  

  let img = imagesDict[classResult];
  if (img) {
    image(img, 0, 0);
  }
  
  // fill(255)
  // textSize(42)
  // text(classResult, 100, 100)
}

function classify() {
  const numLabels = knnClassifier.getNumLabels();    
  const features = featureExtractor.infer(video);  
  knnClassifier.classify(features, gotResults);   
  // console.log(knnClassifier); 
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