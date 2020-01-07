// Setup Paper.js
paper.install(this)

let overlayScope = new PaperScope().setup('overlay')
let scannerScope = new PaperScope().setup('scanner')

scannerScope.activate()
let scannerRaster = new Raster()
let scannerGrid = scannerScope.project.importSVG('scanner-grid')
let scannerBoxes = []
for (const box of scannerGrid.children) {
  if (box.strokeColor) {
    box.scale(0.5)
    box.strokeColor = 'green'
    scannerBoxes.push(box)
  }
}

// Setup video once OpenCV is ready:
cv.onRuntimeInitialized = setupVideo

async function setupVideo() {
  // Grab video element and associate it with the camera
  // See https://davidwalsh.name/browser-camera
  let video = document.getElementById('video')
  // Get access to the camera:
  let mediaDevices = navigator.mediaDevices
  if(mediaDevices && mediaDevices.getUserMedia) {
    const stream = await mediaDevices.getUserMedia({
      video: {
        width: { min: 1280 },
        height: { min: 720 }
      }
    })
    video.srcObject = stream
    // Use a promise to wait until the video can play through.
    await new Promise(resolve => {
      video.addEventListener('canplaythrough', resolve)
    })
    // Create an invisible canvas to draw video frames to, in order to find contours.
    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    video.play()

    let processVideo = () => {
      findCountourAndWarpImage(video, canvas)
      requestAnimationFrame(processVideo)
    }

    processVideo()
  }
}

function findCountourAndWarpImage(video, canvas) {
  try {
    // Draw current video frame to canvas.
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    // Use some thresholding on the frame, then find contours:
    let src = cv.imread(canvas)
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
    // Sadly, I get memory leaks with adaptive thresholding:
    if (false) {
      cv.adaptiveThreshold(src, src, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)
    } else {
      cv.threshold(src, src, 128, 255, cv.THRESH_BINARY_INV)
    }
    let contours = new cv.MatVector()
    let hierarchy = new cv.Mat()
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    // Convert the countours to Paper.js paths
    overlayScope.activate()
    overlayScope.project.clear()
    let paths = convertContoursToPaths(contours, 32, 64, {
      strokeColor: 'red'
    })
    hierarchy.delete()
    contours.delete()
    // Find the largest path, which should be the bounding box around the card:
    let bounds = findLargestPath(paths)
    // Remove all other contour paths again:
    for (let path of paths) {
      if (path !== bounds) {
        path.remove()
      } 
    }
    // Only carry on if the bounds consist of exactly 4 corners.
    if (bounds && bounds.segments.length === 4) {
      warpImageToBounds(src, bounds)
      // Now bring the image to scannerScope through a Paper.js Raster in the
      // scannerScope
      cv.imshow(canvas, src)
      scannerScope.activate()
      scannerRaster.size = new Size(canvas)
      scannerRaster.drawImage(canvas)
      scannerRaster.position = scannerScope.view.center
      scannerGrid.bounds = scannerRaster.bounds
      // Scale a little bit, to better match the actual bitmap positions:
      scannerGrid.scale(1.005)
      scannerGrid.visible = true
      console.log('Options', getOptionsFromScannerBoxes())
    } else {
      scannerRaster.clear()
      scannerGrid.visible = false
    }
    src.delete()
    return paths
  }
  catch (error) {
    console.error(error)
    return []
  }
}

function findLargestPath(paths) {
  let largestArea = 0
  let largestPath = null
  for (let path of paths) {
    let area = Math.abs(path.area)
    if (area > largestArea) {
      largestPath = path
      largestArea = area
    }
  }
  return largestPath
}

function warpImageToBounds(image, bounds) {
  let width = image.cols
  let height = image.rows
  let size = new cv.Size(width. height)
  // Find the top-left corner, by ordering the points by y and x coords:
  let points = bounds.segments.map(seg => seg.point)
  let topPoints = [...points].sort((a, b) => a.y < b.y ? -1 : 1).slice(0, 2)
  let topLeftPoint = topPoints.sort((a, b) => a.x < b.x ? -1 : 1)[0]
  // Now rearrange the points so the top-left point comes first:
  while (true) {
    let point = points.shift()
    if (point === topLeftPoint) {
      points.unshift(point)
      break
    } else {
      points.push(point)
    }
  }
  let [p1, p2, p3, p4] = points
  new Path.Circle({
    center: topLeftPoint,
    radius: 10,
    strokeColor: 'red'
  })
  let fromRect = cv.matFromArray(4, 1, cv.CV_32FC2, [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y])
  let toRect = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 0, height, width, height, width, 0])
  let mx = cv.getPerspectiveTransform(fromRect, toRect)
  fromRect.delete()
  toRect.delete()
  cv.warpPerspective(image, image, mx, size)
  mx.delete()
}

function getOptionsFromScannerBoxes() {
  let options = {}
  // Loop through all boxes and assign the options based on their names in
  // the SVG document.
  for (const box of scannerBoxes) {
    var chosen = scannerRaster.getAverageColor(box.bounds).gray > 0.5
    box.fillColor = chosen ? 'green' : 'red'
    if (box.name) {
      let [groupKey, optionKey] = box.name.split(/(^|[A-Z][a-z0-9]*)/)
      let group = options[groupKey] || (options[groupKey] = {})
      group[optionKey.toLowerCase()] = chosen 
    }
  }
  // Loop again through all option-groups, and process the random settings:
  for (const group of Object.values(options)) {
    if (group.random) {
      const keys = Object.keys(group).filter(key => key !== 'random')
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      group[randomKey] = true
    }
  }
  return options
}

function convertContoursToPaths(contours, minArea = 0, approxPolyEpsilon = 0, pathProperties = {}) {
  let paths = []
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i)
    let approx = null
    if (approxPolyEpsilon > 0) {
      approx = new cv.Mat()
      cv.approxPolyDP(contour, approx, approxPolyEpsilon, true)
      contour = approx
    }
    if (cv.contourArea(contour) > minArea) {
      let points = []
      let data = contour.data32S
      for (let j = 0; j < data.length; j += 2){
        let pt = new Point(data[j], data[j + 1])
        points.push(pt)
      }
      let path = new Path({
        segments: points,
        closed: true,
        ...pathProperties
      })
      paths.push(path)
    }
    if (approx) {
      approx.delete()
    }
  }
  return paths
}
