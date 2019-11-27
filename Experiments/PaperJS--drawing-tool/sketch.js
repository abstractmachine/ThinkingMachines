// Setup
paper.setup('canvas')
// Get references to used paper classes and instances
let { Path, Point, Tool, view } = paper

// Main script starts here
let path

let tool = new Tool({
  onMouseDown(event) {
    path = new Path({
      strokeColor: 'black'
    })
    path.add(event.point)
  },

  onMouseDrag(event) {
    path.add(event.point)
  },

  onMouseUp(event) {
    path.smooth()
    console.log(path)
  }
})