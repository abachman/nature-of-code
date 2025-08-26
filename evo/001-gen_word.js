'use strict'

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function gen(letters /* string[] */, word /* string[] */, attempt /* string[] */) {
  if (attempt.length === word.length) {
    let i = 0
    while (i < attempt.length && attempt[i] === word[i]) {
      i++
    }
    return i === attempt.length
  }
  attempt.push(choose(letters))
  return gen(letters, word, attempt)
}

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
const word = 'paste'.split('')
let found = false
let attempts = 0

function setup() {
  performance.mark('start')
  createCanvas(460, 200)
  textSize(16)
  console.log('start')
  noLoop()
}

function draw() {
  background(0)
  fill(255)
  while (!found) {
    found = gen(letters, word, [])
    attempts++
  }

  console.log('end')
  performance.mark('end')
  const m = performance.measure('run', 'start', 'end')
  const { duration } = m

  text(
    `found '${word.join('')}' in ${attempts} attempts, ${duration.toFixed(2)}ms, ${(attempts / duration).toFixed(
      2
    )} a/ms`,
    10,
    20
  )
}
