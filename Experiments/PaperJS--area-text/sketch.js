// Setup paper globally 
paper.install(window)
paper.setup('canvas')

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

let text = `our hero's parents wanted to have child. I want to have child too." \n` +
    '\n' +
    '"Oh, you, we will never marry you. You are too young, our hero." \n' +
    '\n' +
    '"I was never much of a boy, our hero. I was always a girl, I guess." \n' +
    '\n' +
    '"Well, our hero, you are a beautiful child, donor." \n' +
    '\n' +
    '"Oh, no, donor, she is a very beautiful girl. I wish we had her as our wife. When $Parent was having a wine helper told her she was going to have a gift. The poor little bird had been so distressed by her gift that she had begun to cry. Then the helper came into the room for a moment, and said: \n' +
    '\n' +
    "'donor, I want you to eat some meat. I am too tired for this.' \n" +
    '\n' +
    "'No,' said the little maiden, 'I do not like bacon. I am too fat. Let me go. What helper said came true and our hero was born, $Parents organized a feast inviting wolf even the donors except one. The poor old woman was taken to the hospital and this is what she says happened. She was brought the news of donor's birth and donor was sent to get an  urn of money to bring to donor.' \n" +
    '\n' +
    "'But, our hero, if you see donor, you shall know he is a our hero. He is, after all, the most beautiful woman in all the world. The feast was splendid and all donors gave our hero magical objects intelligence. Children threw their arms around donor and their places in the crowd. The magical objects opened their mouths and sang, 'The children will no doubt tear us to pieces, but the magical objects will take us up again. They shall eat us alive, if we are brave enough. When all donors where done, villain came in mad because she wasn’t invited cursing our hero saying that she will poisoned herself and die. So she had to do it. But, helper was so angry when helper was made helper took a knife and cut helper’s heart, and when he saw the same thing he said, “The heart is yours!” helper was so happy and delighted, and he ate the heart out of it. So he had helper bring the helper child back from the helper child, and the helper child came and ate the helper child. The last donor came forward and said that our hero will singing for a hundred years. I will sing for as long as there is a our hero in the world. And I will still have a little heart if the rest of you are as merry as you are happy. And I will still have a little boy if you are as happy as you are merry.' \n" +
    '\n' +
    'And donor said nothing, and went on singing with all his might. $Parent decided that all microphone of the castle should be burned, meanwhile our hero was loved by everyone. So our hero left the chamber and went down to the stairs. There he found the old helper, who told him that he had seen the helper sleeping in the cupboard. \n' +
    '\n' +
    '"Now now!" cried our hero, "let us go as fast as we can; each must do his job." \n' +
    '\n' +
    `But our hero had no courage; for at last he heard the door open, and a large, hairy man entered. The day she turned 15, our hero went to the quiet room, where she found villain using an old prick. villain lured our hero to use the prick, when she did our hero strangled. When she did everyone around the castle quiet room fell asleep too. our hero was in place all the night, and the night was full of games and games made all the more dangerous by the fact that she had to stand in a square corner and use her right hand to reach place. She slept so soundly that the noise was quite unheard. After long years prince heard about the beautiful our hero story, since many tried to enter the castle without success. Since the 100 years passed the flowers parted to let the prince in. When prince saw our hero, he slap her to awaken her. That evening he kissed her again and went to the royal palace. When he reached the gates, he had the good royal permission to enter. He found the castle and castle of the our hero, and he stayed there with the our hero. After many nights and many days the flowers sprung up again. However, on the night of the third day, they had grown so large that he could not sleep and the flowers had to be dragged by themselves. Thanks to prince all the castle was awake, they celebrated our hero’s and prince's break up marriage. Now that she’s married again, they wanted to have a child who was a little bigger than all the other boys, and they told her all about it: helper, donor, and donor. And she said, "Well, I don’t understand it, but it’s so pretty, donor and donor." And she said, "No, no, it isn’t." She couldn’t understand it.`

// Create a hyphenator for US English that inserts silent hyphens
// (&shy; = '\xad') in all potential places of hyphenation.
// The fillPathsWithText() algorithm below then uses these to add
// visual hyphens in places where hyphenation actually happens.

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
      if (part === undefined) break
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
        if (part === undefined) break
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
  return { textItems, unconsumedText }
}

function setContent(textItem, content) {
  textItem.content = content.endsWith('\xad') ? `${content}-` : content
}

let { unconsumedText } = fillPathsWithText([path1, path2], text, settings)
console.log('Unconsumed text:', unconsumedText)
