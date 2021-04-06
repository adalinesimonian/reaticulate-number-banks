#!/usr/bin/env node

import fs from 'fs'
import printUsage from './modules/usage.js'
import ReabankNumberer from './modules/reabank-numberer.js'

const args = process.argv.slice(2)

if (args.includes('-?') || args.includes('--help')) {
  printUsage(true)
  process.exit(0)
}

/**
 * Whether or not to print the modified Reabank file to the console instead of
 * writing to disk.
 * @type {boolean}
 */
const printOutput = args.includes('--print') || args.includes('-p')
/**
 * Whether or not to maintain any existing LSBs that aren't set to 0.
 * @type {boolean}
 */
const maintain = args.includes('--maintain') || args.includes('-m')
/**
 * Whether or not to renumber all LSB definitions, regardless of whether or
 * not they are set to 0.
 * @type {boolean}
 */
const reset = args.includes('--reset') || args.includes('-r')
/**
 * Whether or not to print more details during processing.
 * @type {boolean}
 */
const verbose = args.includes('--verbose') || args.includes('-v')
/**
 * Whether or not to print the LSB/articulation pairs after processing.
 * @type {boolean}
 */
const show = args.includes('--show') || args.includes('-s')

/**
 * Prints data to console so long as the verbose flag is set and the print
 * output flag is unset.
 * @param  {...any} data Data to print to console.
 */
const logVerbose = (...data) => {
  if (verbose && !printOutput) {
    console.log(...data)
  }
}

/**
 * An array of paths passed to the script.
 * @type {string[]}
 */
const paths = args.filter(arg =>
  arg !== '--print' && arg !== '-p' &&
  arg !== '--maintain' && arg !== '-m' &&
  arg !== '--reset' && arg !== '-r' &&
  arg !== '--verbose' && arg !== '-v' &&
  arg !== '--show' && arg !== '-s'
)

if (paths.length === 0) {
  console.error('Path not given.')
  printUsage()
  process.exit(1)
}

/**
 * The path to the input Reabank file.
 * @type {string}
 */
const inputPath = paths[0]
/**
 * The path to which to write the updated Reabank file.
 * @type {string}
 */
const outputPath = paths.length > 1 ? paths[1] : paths[0]

logVerbose('Reading Reabank file...')

/**
 * The contents of the input Reabank file.
 * @type {string}
 */
const input = (() => {
  try {
    return fs.readFileSync(inputPath, 'utf8')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

/**
 * The numberer instance to use to number definitions and articulations
 * in the Reabank file.
 * @type {ReabankNumberer}
 */
const numberer = new ReabankNumberer(input, verbose, logVerbose)

numberer.numberLsbs(maintain, reset)

/**
 * The new Reabank file contents.
 * @type {string}
 */
const output = numberer.output()

if (printOutput) {
  console.log(output)
  process.exit(0)
}

logVerbose('Writing file...')

try {
  fs.writeFileSync(outputPath, output)
} catch (error) {
  console.error(error)
  process.exit(1)
}

logVerbose(`Updated Reabank file written to ${outputPath}.`)

if (show) {
  numberer.articulations()
    .forEach(([lsb, articulation]) => console.log(`${lsb}\t${articulation}`))
}
