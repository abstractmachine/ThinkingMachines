// Setup paper globally
paper.install(window)
paper.setup('canvas')

// global status
let getPathFromVideo = true

let globalPaths

let settings = {
  leading: 22, // <- this is another word for line-height
  fontSize: 19,
  fontFamily: 'Helvetica Neue',
  fontWeight: 'normal',
  fillColor: 'black'
}

let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in vulputate elit. Nunc efficitur ipsum venenatis, placerat ante eu, pharetra justo. Pellentesque consectetur justo malesuada lectus ullamcorper aliquet. Duis ultrices luctus diam quis molestie. Nunc augue eros, viverra non est in, placerat hendrerit metus. Phasellus aliquam dignissim nulla, ac commodo lectus placerat vitae. Aliquam tempus vel quam ac lacinia. Aenean vitae sodales eros.

Etiam est nisi, placerat eget interdum vel, bibendum non nisi. Aenean molestie, tortor pretium lobortis luctus, massa massa mollis tellus, dignissim blandit sem magna sed mauris. Ut ullamcorper libero lacus, tincidunt congue lorem tincidunt eget. Pellentesque sodales diam purus, sed tincidunt sapien ornare eu. Donec feugiat congue enim, ac sollicitudin eros aliquet sit amet. Mauris nec viverra lectus, hendrerit volutpat ligula. Nam pellentesque sollicitudin erat. Cras laoreet vehicula volutpat. Pellentesque vestibulum varius odio ut mattis.

Nulla convallis dolor et aliquet molestie. Nulla felis sem, auctor et pharetra eu, blandit elementum velit. Pellentesque elementum auctor metus, elementum rutrum risus pulvinar vel. Praesent ultricies felis lacinia volutpat scelerisque. Ut consequat diam nisl, sit amet fermentum ex consectetur id. Ut ut pulvinar metus. Suspendisse maximus molestie tincidunt.

Morbi volutpat elit ac finibus porta. Nullam nulla erat, facilisis eu blandit at, accumsan a dui. Phasellus consectetur velit vel odio maximus imperdiet. Nulla purus justo, sagittis vitae placerat quis, convallis sed purus. Maecenas ullamcorper, augue laoreet varius ullamcorper, purus lectus cursus lorem, vel tristique lorem odio at leo. Maecenas maximus nunc eleifend leo suscipit dapibus. Pellentesque orci elit, mollis ut tempor quis, convallis sed ligula. Ut auctor est vel molestie fermentum. Donec mattis ut felis non eleifend. In eleifend nulla vel metus facilisis, a eleifend nunc interdum. Mauris malesuada condimentum lectus quis ultrices.`


// Setup video once OpenCV is ready:
cv.onRuntimeInitialized = setupVideo

initEventListenerToGenerateLayout();

/**
 *
 * @return {Promise<void>}
 */
async function setupVideo(callOnVideoFrame) {
  // Grab video element and associate it with the camera
  // See https://davidwalsh.name/browser-camera
  let video = document.getElementById('video');
  // Get access to the camera:
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    // Use a promise to wait until the video can play through.
    await new Promise(resolve => {
      video.addEventListener('canplaythrough', resolve);
    });
    // Create a canvas to draw video frames to, in order to find contours.
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    video.play();

    view.onFrame = () => {
      if (getPathFromVideo) {
        const paths = findContourPaths(video, canvas)
        globalPaths = filterPaths(paths)
      }
    }
  }
}

function initEventListenerToGenerateLayout() {
  document.addEventListener('click', () => {

    getPathFromVideo = false

    try {
      let unconsumedText = fillPathsWithText(globalPaths, text, settings)
      console.log('Uncosumed text:', unconsumedText)
    }
    catch (e) {
      console.error(e)
    }
  })
}

function filterPaths(paths) {
  let filtered = []
  for (const path1 of paths) {
    let keepPath = false
    for (const path2 of paths) {
      if (
          path1 !== path2 &&
          path1.position.getDistance(path2.position) < 16 &&
          path1.bounds.contains(path2.bounds)
      ) {
        keepPath = true
        break
      }
    }
    if (keepPath) {
      filtered.push(path1)
    } else {
      path1.remove()
    }
  }
  return filtered
}

/**
 *
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @return {[]}
 */
function findContourPaths(video, canvas) {
  try {
    // Draw current video frame to canvas.
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    // Use some thresholding on the frame, then find contours:
    let hierarchy = new cv.Mat();
    let contours = new cv.MatVector();
    let src = cv.imread(canvas);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 100, 255, cv.THRESH_BINARY);
    cv.findContours(src, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
    // Convert the countours to Paper.js paths
    project.clear();
    let paths = convertContoursToPaths(contours, 32, {
      strokeColor: 'red'
    });
    src.delete();
    contours.delete();
    hierarchy.delete();
    return paths;
  }
  catch (error) {
    console.error(error);
  }
}

function convertContoursToPaths(contours, minArea = 0, pathProperties = {}) {
  let paths = [];
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    if (cv.contourArea(cnt) > minArea) {
      let points = [];
      let data = cnt.data32S;
      for (let j = 0; j < data.length; j += 2){
        let pt = new Point(data[j], data[j + 1])
        points.push(pt)
      }
      let path = new Path({
        segments: points,
        closed: true,
        ...pathProperties
      });
      paths.push(path);
    }
  }
  return paths;
}

let hypher = new Hypher(Hypher.languages['en-us'])

function fillPathsWithText(paths, text, settings) {
  let lines = []

  for (let path of paths) {
    // For each path, create basseline grid for text, and intersect it with the
    // path geometry to receive the parts of the grid that lie inside the path:
    let bounds = path.bounds
    let leading = settings.leading
    for (let y = bounds.top + leading; y <= bounds.bottom; y += leading) {
      let line = new Path({
        segments: [
          [bounds.left, y],
          [bounds.right, y]
        ],
        strokeColor: 'blue'
      })
      lines.push(line.intersect(path, { trace: false }))
      line.remove()
    }

  }

  // Split text text at white-space characters as well as silent hyphens as
  // inserted by the hyphenator, but also capture these white-spaces and hyphens
  // so that line-breaks can be dealt with below.
  let parts = hypher.hyphenateText(text).split(/([\s\xad])/)

  for (let line of lines) {
    let lineParts = line.children || [line]
    for (let linePart of lineParts) {
      let part = parts.shift()
      // Skip white-space at the beginning of the line
      while (/^ +$/.test(part)) {
        part = parts.shift()
      }
      let start = linePart.bounds.bottomLeft
      let width = linePart.bounds.width

      let content = part
      let text = new PointText({
        content: content,
        point: start,
        ...settings
      })
      let fittingContent
      let lineBreak = false
      while (text.bounds.width < width) {
        fittingContent = content
        part = parts.shift()
        if (!part) continue
        if (/\n/.test(part)) {
          lineBreak = true
          break
        }
        content += part
        setContent(text, content)
      }
      if (lineBreak) {
        break
      } else if (fittingContent) {
        setContent(text, fittingContent)
        // Put the last non-fitting part back into the stack
        parts.unshift(part)
      } else {
        text.remove()
      }
    }
  }

  // Return the text that wasn't consumed yet
  let unconsumed = parts.join('')
  return unconsumed
}

function setContent(textItem, content) {
  textItem.content = content.endsWith('\xad') ? `${content}-` : content
}
