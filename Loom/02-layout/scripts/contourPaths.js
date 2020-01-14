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

export function findContourPaths(video, canvas, crop) {
  try {
    // Draw current video frame to canvas.
    canvas.getContext('2d').drawImage(
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
    // Use some thresholding on the frame, then find contours:
    let hierarchy = new cv.Mat()
    let contours = new cv.MatVector()
    let src = cv.imread(canvas)
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 110, 255, cv.THRESH_BINARY_INV)
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    // Convert the countours to Paper.js paths
    let paths = convertContoursToPaths(contours, 32, {
      strokeColor: 'black',
      strokeScaling: false
    })
    src.delete()
    contours.delete()
    hierarchy.delete()
    // paths = filterContourPaths(paths, canvas)
    return paths
  }
  catch (error) {
    console.error(error)
  }
}

export function filterContourPaths(paths, canvas) {
  let results = []
  for (const path of paths) {
    let remove = false
    for (const curve of path.curves) {
      if (curve.isStraight() && curve.length > 10) {
        let point = curve.point1
        console.log(point, curve.isHorizontal(), curve.isVertical())
        if (
          curve.isHorizontal() && (
            point.y === 0 ||
            point.y === canvas.width - 1
          ) ||
          curve.isVertical() && (
            point.x === 0 ||
            point.x === canvas.height - 1
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

export function convertContoursToPaths(contours, minArea = 0, pathProperties = {}) {
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
      path.reduce({ simplify: true })
      paths.push(path)
    } 
  }
  return paths
}
