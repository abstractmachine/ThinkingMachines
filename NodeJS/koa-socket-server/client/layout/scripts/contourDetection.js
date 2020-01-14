import paper from "../../web_modules/paper/dist/paper-full.js"

/**
 * @return {Promise<void>}
 */
export async function setupVideo() {

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
    }
}

export function filterPaths(paths) {
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
export function findContourPaths(video, canvas) {
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
        paper.project.clear();
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
                let pt = new paper.Point(data[j], data[j + 1])
                points.push(pt)
            }
            let path = new paper.Path({
                segments: points,
                closed: true,
                ...pathProperties
            });
            paths.push(path);
        }
    }
    return paths;
}
