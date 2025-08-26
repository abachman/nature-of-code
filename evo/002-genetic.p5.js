/*
 A Genetic Algorithm follows three steps:
  1. Initialization
  2. Selection
    * Fitness
    * Mating Pool Creation
    * Select Parents
  3. Reproduction
    * Crossover
    * Mutation (optional)
*/

const max_pop = 1000
const TARGET = 'at least i have this going for me'.split('')

class DNA {
  // length: int
  // genes: string[]
  constructor(length) {
    this.length = length
    this.genes = []
    this.fitness = 0

    for (let i = 0; i < this.length; i++) {
      this.genes[i] = randomChar()
    }
  }

  get phrase() {
    return this.genes.join('')
  }

  calcFitness(target /* string[] */) {
    let score = 0
    for (let i = 0; i < target.length; i++) {
      if (this.genes[i] === target[i]) score++
    }
    this.fitness = score / target.length
  }

  crossover(other /* DNA */) {
    const next = new DNA(other.genes.length)

    // pick middle and half/half
    const mid = floor(random(other.genes.length))

    // pick randomly at each char
    for (let i = 0; i < other.genes.length; i++) {
      // midpoint
      next.genes[i] = i < mid ? this.genes[i] : other.genes[i]

      // // random swap
      // next.genes[i] = random() > 0.5 ? this.genes[i] : other.genes[i]
    }

    return next
  }

  mutate(rate) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random() > 1.0 - rate) {
        this.genes[i] = randomChar()
      }
    }
  }
}

class Population {
  constructor() {
    this.c = []
  }

  get length() {
    return this.c.length
  }

  add(dna) {
    this.c.push(dna)
  }

  thin() {
    // cull the herd, don't let bottom 10%
    let weights = []
    for (let phrase of this.c) {
      weights.push(phrase.fitness)
    }
    weights.sort()
    const lowest_ten_perc = weights[floor(0.3 * this.length)]

    let cull = 0
    for (let phrase of this.c) {
      if (phrase.fitness <= lowest_ten_perc) {
        phrase.fitness = 0
        cull++
      }
    }
    return [lowest_ten_perc, cull]
  }

  normalize() {
    let sum = 0
    for (let phrase of this.c) {
      sum += phrase.fitness
    }

    for (let phrase of this.c) {
      phrase.fitness = phrase.fitness / sum
    }
  }

  // DNA with greatest fitness first
  max() /* returns DNA */ {
    let max = -1,
      best = null
    for (let phrase of this.c) {
      if (phrase.fitness > max) best = phrase
    }
    return best
  }

  createMatingPool() {
    this.matingPool = []
    for (let phrase of this.c) {
      let n = floor(phrase.fitness * 1000)
      for (let i = 0; i < n; i++) {
        this.matingPool.push(phrase)
      }
    }
  }

  // pick candidate by weightedSelection
  choose(by = 'weighted') {
    if (by === 'weighted') {
      let idx = 0
      let start = random(1.0)

      while (start > 0) {
        start -= this.c[idx].fitness
        idx++
      }
      return this.c[idx - 1]
    } else if (by === 'pool') {
      if (!this.matingPool) {
        this.createMatingPool()
      }
      return choose(this.matingPool)
    }
  }

  // pick two parents
  parents() {
    let a = this.choose()
    let b = this.choose()
    while (a == b) {
      b = this.choose()
    }
    return [a, b]
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this.c[i]
    }
  }
}

// ------------

let y = 14,
  ystep = 16
let population = new Population()

function setup() {
  // 1. Initialization
  createCanvas(400, 600)
  textFont('monospace', 12)
  noStroke()
  background(51)
  performance.mark('start')
  for (let i = 0; i < max_pop; i++) {
    population.add(new DNA(TARGET.length))
  }
}

function draw() {
  // 2. Selection
  //   * Fitness

  for (let phrase of population) {
    phrase.calcFitness(TARGET)
  }

  const first = population.max()

  // draw best answer
  fill(51)
  rect(0, y - ystep + 2, width - 46, ystep * 2 + 4)
  if (first.fitness === 1) {
    fill(0, 128, 255)
  } else {
    fill(255)
  }
  text(first.phrase, 10, y)
  y = y + ystep
  if (y > height - ystep) {
    y = ystep
  }

  // show candidates
  if (frameCount % 10 === 0) {
    let x = width - 44

    fill(51)
    rect(x - 1, 0, width, height)

    fill(170)
    // T 315
    // o 010
    //   91 for me0
    for (let l = 0; l < TARGET.length; l++) {
      const ly = ystep + ystep * l
      const letter = TARGET[l]
      text(letter, x, ly)
      // for each character in TARGET, count creatures with that strand
      let count = population.c.reduce((sum, phrase) => (sum += phrase.genes[l] === letter ? 1 : 0), 0)
      count = String(count).padStart(3, '0')
      text(count, x + 10, ly)
    }

    let sum = 0
    for (let phrase of population) {
      sum += phrase.fitness
    }
    text(((sum / population.length) * 100).toFixed(2), x, height - 4)
  }

  if (first.fitness === 1) {
    const measure = performance.measure('run', 'start')
    const msg = `${frameCount} generations in ${(measure.duration / 1000.0).toFixed(4)}s`
    fill(50, 255, 120)
    text(msg, 10, y)
    noLoop()
  }

  if (frameCount % 16 === 0) {
    const [val, cull] = population.thin()
    console.log(`${cull} died for fitness under ${val}`)
  }
  population.normalize()

  let npop = new Population()

  for (let n = 0; n < population.length; n++) {
    //   * Select Parents
    let [parentA, parentB] = population.parents()

    // 3. Reproduction
    let child = parentA.crossover(parentB)
    child.mutate(0.01)

    npop.add(child)
  }

  population = npop
}

function keyPressed() {
  if (key === ' ') {
    noLoop()
  }
}

/// utility functions

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz '.split('')
function randomChar() {
  return choose(ALPHABET)
  // const n = floor(random(32, 127))
  // return String.fromCharCode(n)
}

function choose(arr) {
  // use p5js random selection
  return random(arr)
}
