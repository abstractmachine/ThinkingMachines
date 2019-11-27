// Setup
paper.setup('canvas')
// Get references to used paper classes and instances
let { Path, Point, Tool, view } = paper

// Adapted from the following Processing example:
// http://processing.org/learning/topics/follow3.html

// The amount of points in the path:
let numPoints = 25

// The distance between the points:
let length = 35

let path = new Path({
  strokeColor: '#E4141B',
  strokeWidth: 20,
  strokeCap: 'round'
})

let start = view.center.divide([10, 1])
for (let i = 0; i < numPoints; i++) {
  path.add(start + new Point(i * length, 0))
}

let tool = new Tool({
  onMouseMove(event) {
    path.firstSegment.point = event.point
    for (let i = 0; i < numPoints - 1; i++) {
      let segment = path.segments[i]
      let nextSegment = segment.next
      let vector = segment.point.subtract(nextSegment.point)
      vector.length = length
      nextSegment.point = segment.point.subtract(vector)
    }
    path.smooth({ type: 'continuous' })
  },

  onMouseDown(event) {
    path.fullySelected = true
    path.strokeColor = '#e08285'
  },

  onMouseUp(event) {
    path.fullySelected = false
    path.strokeColor = '#e4141b'
  }
})
