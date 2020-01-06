// Setup Paper.js
paper.install(this)
paper.setup('canvas')

// Setup video once OpenCV is ready:
cv.onRuntimeInitialized = setupVideo

async function setupVideo() {
  // Grab video element and associate it with the camera
  // See https://davidwalsh.name/browser-camera
  let video = document.getElementById('video')
  // Get access to the camera:
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.srcObject = stream
    // Use a promise to wait until the video can play through.
    await new Promise(resolve => {
      video.addEventListener('canplaythrough', resolve)
    })
    // Create a canvas to draw video frames to, in order to find contours.
    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    video.play()
    view.onFrame = () => {
      let paths = findContourPaths(video, canvas)
      paths = filterPaths(paths)
    }
  }
}

function findContourPaths(video, canvas) {
  try {
    // Draw current video frame to canvas.
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    // Use some thresholding on the frame, then find contours:
    let hierarchy = new cv.Mat()
    let contours = new cv.MatVector()
    let src = cv.imread(canvas)
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)
    cv.threshold(src, src, 128, 255, cv.THRESH_BINARY_INV)
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    // Convert the countours to Paper.js paths
    project.clear()
    let paths = convertContoursToPaths(contours, 32, {
      strokeColor: 'red'
    })
    src.delete()
    contours.delete()
    hierarchy.delete()
    return paths
  }
  catch (error) {
    console.error(error)
  }
}

function filterPaths(paths) {
  let results = []
  let bounds = view.bounds
  for (const path of paths) {
    let remove = false
    for (const curve of path.curves) {
      if (curve.isStraight()) {
        let point = curve.point1
        if (
          curve.isHorizontal() && (
            point.y === bounds.top ||
            point.y === bounds.bottom - 1
          ) ||
          curve.isVertical() && (
            point.x === bounds.left ||
            point.x === bounds.right - 1
          )
         ) {
          remove = true
          break
        }
      }
    }
    if (remove) {
      path.remove()
    } else {
      results.push(path)
    }
  }
  return results
}

function convertContoursToPaths(contours, minArea = 0, pathProperties = {}) {
  let paths = []
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i)
    if (cv.contourArea(cnt) > minArea) {
      let points = []
      let data = cnt.data32S
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
  }
  return paths
}
