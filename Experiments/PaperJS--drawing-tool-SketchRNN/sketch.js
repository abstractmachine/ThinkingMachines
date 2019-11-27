// Setup
paper.setup('canvas')
// Get references to used paper classes and instances
let { Path, Point, Tool, view } = paper
// Run our setup function asynchronously, with error handling (ignore this line)
;(async () => setup())().catch(err => console.error(err))

// Sketch
let model
let ready = false
let path
let points = []
let nextPoint = null
let nextStroke = null
let strokePath = null
let timer = null

async function setup() {
  model = await ml5.sketchRNN('cat')
  ready = true
}

let tool = new Tool({
  minDistance: 4,

  onMouseDown(event) {
    path = new Path({ strokeColor: 'black' })
    path.add(event.point)
    cancelTimer()
  },

  onMouseDrag(event) {
    path.add(event.point)
    path.smooth()
    points.push({
      dx: event.delta.x,
      dy: event.delta.y,
      pen: 'down'
    })
  },

  async onMouseUp(event) {
    path.add(event.point)
    path.smooth()
    points.push({
      dx: event.delta.x,
      dy: event.delta.y,
      pen: 'up'
    })
    nextPoint = event.point
    startTimer()
  }
})

function cancelTimer() {
  clearTimeout(timer)
}

function startTimer() {
  cancelTimer()
  timer = setTimeout(async () => {
    if (ready) {
      model.reset()
      nextStroke = await model.generate(points)
      points = []
    }
  }, 1000)
}

view.onFrame = async function() {
  if (nextStroke && nextStroke.pen !== 'end') {
    if (!strokePath) {
      strokePath = new Path({ strokeColor: 'red' })
    }
    nextPoint = nextPoint.add(nextStroke.dx, nextStroke.dy)
    strokePath.add(nextPoint)
    path.smooth()
    if (nextStroke.pen === 'up') {
      strokePath = null
    }
    // Clear nextStroke, before asynchronously requesting the next one in the sequence
    nextStroke = null
    nextStroke = await model.generate()
  }
}
