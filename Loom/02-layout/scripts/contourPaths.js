export async function captureVideo(video) {
  let { mediaDevices } = navigator
  if (mediaDevices && mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    const stream = await mediaDevices.getUserMedia({ video: true })
    video.srcObject = stream
    // Use a promise to wait until the video can play through.
    await new Promise(resolve => {
      video.addEventListener('canplaythrough', resolve)
    })
    video.play()
    return true
  }
  return false
}

export function findContourPaths(options) {
  try {
    // Draw current video frame to canvas.
    let { video, canvas, crop, flip } = options
    let ctx = canvas.getContext('2d')
    ctx.save()
    if (flip) {
      ctx.translate(canvas.width, canvas.height)
      ctx.scale(-1, -1)
    }
    ctx.drawImage(
      video,
      // Source:
      crop.left,
      crop.top,
      video.videoWidth - crop.left - crop.right,
      video.videoHeight - crop.top - crop.bottom,
      // Dest:
      0,
      0,
      canvas.width,
      canvas.height
    )
    ctx.restore()
    // Use some thresholding on the frame, then find contours:
    let hierarchy = new cv.Mat()
    let contours = new cv.MatVector()
    let src = cv.imread(canvas)
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 110, 255, cv.THRESH_BINARY_INV)
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    // Convert the countours to Paper.js paths
    let paths = convertContoursToPaths(contours, options)
    src.delete()
    contours.delete()
    hierarchy.delete()
    return paths
  }
  catch (error) {
    console.error(error)
  }
}

export function convertContoursToPaths(contours, options = {}) {
  let paths = []
  let {
    minArea = 0,
    approxPolyEpsilon = 0,
    pathProperties = {}
  } = options
  for (let i = 0; i < contours.size(); i++) {
    let contour = contours.get(i)
    if (cv.contourArea(contour) > minArea) {
      let approx = null
      if (approxPolyEpsilon > 0) {
        approx = new cv.Mat()
        cv.approxPolyDP(contour, approx, approxPolyEpsilon, true)
        contour = approx
      }
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
      if (approx) {
        approx.delete()
      }
      path.reduce({ simplify: true })
      paths.push(path)
    } 
  }
  return paths
}
