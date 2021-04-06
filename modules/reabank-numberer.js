import ReabankParser from './reabank-parser.js'

export default class ReabankNumberer {
  /**
   * An array of lines in the Reabank file.
   * @type {string[]}
   */
  #lines

  /**
   * The parser with which to process the Reabank file.
   */
  #parser = new ReabankParser()

  /**
   * Whether or not to print debugging messages to the console.
   * @type {boolean}
   */
  debug

  /**
   * The log function used to print messages to the console.
   * @type {function(...*):void}
   */
  logger

  /**
   * Reads existing LSB definitions and registers them with the parser.
   */
  #readDefinitions () {
    this.debug && this.logger('Reading definitions...')
    this.#lines.forEach(line => this.#parser.parseDefinition(line, (lsb, articulation) => {
      if (lsb !== '0') {
        this.#parser.registerLsb(lsb, articulation)
      }
    }))
  }

  /**
   * Numbers LSB definitions.
   * @param {boolean} renumberAll Whether or not to renumber all LSB
   * definitions, regardless of whether or not they are set to 0.
   */
  #numberDefinitions (renumberAll) {
    // Unless renumbering all definitions, read read all existing initialized
    // definitions (those not set to 0)
    !renumberAll && this.#readDefinitions()

    this.debug && this.logger('Numbering definitions...')
    this.#lines = this.#lines.map(line => this.#parser.updateDefinition(line, (lsb, articulation) => {
      // Number only uninitialized definitions (those set to 0), unless
      // asked to renumber all definitions
      if (lsb !== '0' && !renumberAll) {
        return lsb
      }

      const newLsb = this.#parser.getNextFreeLsb()
      this.#parser.registerLsb(newLsb, articulation)

      return newLsb
    }))
  }

  /**
   * Numbers articulation LSBs.
   * @param {boolean} maintain Whether or not to leave LSBs unchanged unless
   * they are set to 0.
   */
  #numberArticulations (maintain) {
    this.debug && this.logger('Numbering articulations...')
    this.#lines = this.#lines.map(line => this.#parser.updateArticulation(line, (lsb, articulation) => {
      // If asked to maintain existing articulation LSBs, only change those
      // that are uninitialized (LSB set to 0)
      const change = !maintain || lsb === '0'

      if (!change) {
        this.#parser.registerLsb(lsb, articulation)
        return lsb
      }

      if (this.#parser.hasLsb(articulation)) {
        return this.#parser.getLsb(articulation)
      }

      const newLsb = this.#parser.getNextFreeLsb()
      this.#parser.registerLsb(newLsb, articulation)

      return newLsb
    }))
  }

  /**
   * Instantiates a new numberer for the given Reabank data.
   * @param {string} data The contents of the Reabank file.
   * @param {boolean} debug Whether or not to print debugging messages to the
   * console.
   * @param {function(...*):void} logger The log function to use to print
   * messages to the console.
   */
  constructor (data, debug = false, logger = console.log) {
    if (typeof data !== 'string' && !(data instanceof String)) {
      throw TypeError('Reabank data must be passed as a string.')
    }
    this.#lines = data.split('\n')
    this.debug = debug
    this.logger = logger
  }

  /**
   * Numbers articulation LSBs.
   * @param {boolean} maintain Whether or not to maintain any existing LSBs
   * that aren't set to 0. Defaults to false.
   * @param {boolean} renumberDefinitions Whether or not to renumber all LSB
   * definitions, regardless of whether or not they are set to 0. Defaults
   * to false.
   */
  numberLsbs (maintain = false, renumberDefinitions = false) {
    this.#numberDefinitions(renumberDefinitions)
    this.#numberArticulations(maintain)
    this.debug && this.logger('Finished numbering LSBs.')
  }

  /**
   * Returns all LSBs with their corresponding articulations.
   * @returns {string[][]} An array of string arrays where the first item in
   * each child array is the LSB and the second is the articulation name.
   */
  articulations () {
    return this.#parser.registeredLsbs()
  }

  /**
   * Returns the processed Reabank data.
   * @returns {string} The processed Reabank data.
   */
  output () {
    return this.#lines.join('\n')
  }
}
