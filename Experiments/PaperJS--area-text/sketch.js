// Setup paper globally 
paper.install(window)
paper.setup('canvas')

// Create a hyphenator for US English that inserts silent hyphens
// (&shy; = '\xad') in all potential places of hyphenation.
// The fillPathsWithText() algorithm below then uses these to add
// visual hyphens in places where hyphenation actually happens.

let hyphenChar = '\xad'
let hyphenate = createHyphenator(hyphenationPatternsEnUs, { hyphenChar })

let path1 = new Path.Circle({
  center: view.center.subtract([200, 200]),
  radius: 130,
  strokeColor: 'red'
})

let path2 = new CompoundPath({
  children: [
    new Path.Circle({
      center: view.center.add([100, 100]),
      radius: 250
    }), 
    new Path.Circle({
      center: view.center.add([150, 150]),
      radius: 100
    })
  ],
  fillRule: 'evenodd',
  strokeColor: 'red'
})

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

let unconsumedText = fillPathsWithText([path1, path2], text, settings)
console.log('Uncosumed text:', unconsumedText)

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
  let parts = hyphenate(text).split(/([\s\xad])/)

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
  textItem.content = content.endsWith(hyphenChar) ? `${content}-` : content
}