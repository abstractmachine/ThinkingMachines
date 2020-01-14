let hypher = new Hypher(Hypher.languages['en-us'])

export function fillPathsWithText(paths, text, settings) {
  let lines = []

  for (let path of paths) {
    // For each path, create basseline grid for text, and intersect it with the
    // path geometry to receive the parts of the grid that lie inside the path:
    let bounds = path.bounds
    let leading = settings.leading
    for (let y = bounds.top + leading; y <= bounds.bottom; y += leading) {
      let line = new paper.Path({
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
  let textItems = []

  for (let line of lines) {
    if (!settings.showBaseLine) {
      line.remove()
    }
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
      let text = new paper.PointText({
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
        textItems.push(text)
        // Put the last non-fitting part back into the stack
        parts.unshift(part)
      } else {
        text.remove()
      }
    }
  }

  // Return the text that wasn't consumed yet
  let unconsumedText = parts.join('')
  return { textItems, unconsumedText }
}

export function setContent(textItem, content) {
  textItem.content = content.endsWith('\xad') ? `${content}-` : content
}
