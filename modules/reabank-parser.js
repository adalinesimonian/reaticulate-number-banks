/**
 * Regex that matches an LSB definition line (`//def-lsb LSB Articulation`).
 */
const lsbDefinitionRegex = /^\/\/def-lsb\s(\d+)\s([^-\r]+)(\s-[^\r]+)?\r?$/
/**
 * Regex that matches an articulation definition line (`LSB Articulation`).
 */
const articulationRegex = /^(\d+)\s([^-\r]+)(\s-[^\r]+)?\r?$/

/**
 * Provides methods with which to parse Reabank files.
 */
export default class ReabankParser {
  /**
   * LSBs per articulation. Key is articulation, value is LSB.
   * @type {Map<string, string>}
   */
  #articulationLsbs = new Map()
  /**
   * Articulations per LSB. Key is LSB, value is articulation.
   * @type {Map<string, string>}
   */
  #lsbArticulations = new Map()
  /**
   * LSB conflicts that the user was warned about. Key is articulation,
   * value is two-length array of conflicting LSBs.
   * @type {Map<string, string>}
   */
  #warnedLsbConflicts = new Map()
  /**
   * Articulation conflicts that the user was warned about. Key is LSB,
   * value is two-length array of conflicting articulations.
   * @type {Map<string, string>}
   */
  #warnedArticulationConflicts = new Map()
  /**
   * The last assigned LSB.
   */
  #lastLsb = 0

  /**
   * Warns the user of an articulation assigned to conflicting LSBs.
   * @param {string} lsb1 The first LSB.
   * @param {string} lsb2 The second LSB.
   * @param {string} articulation The articulation.
   */
  #warnConflictingLsb (lsb1, lsb2, articulation) {
    const warned = this.#warnedLsbConflicts.get(articulation)
    if (warned && warned[0] === lsb1 && warned[1] === lsb2) {
      return
    }
    console.warn(`⚠ WARNING! Conflicting LSBs ${lsb1} and ${lsb2} for articulation ${articulation}.`)
    this.#warnedLsbConflicts.set(articulation, [lsb1, lsb2])
  }

  /**
   * Warns the user of an LSB assigned to conflicting articulations.
   * @param {string} articulation1 The first articulation.
   * @param {string} articulation2 The second articulation.
   * @param {string} lsb The LSB.
   */
  #warnConflictingArticulation (articulation1, articulation2, lsb) {
    const warned = this.#warnedArticulationConflicts.get(lsb)
    if (warned && warned[0] === articulation1 && warned[1] === articulation2) {
      return
    }
    console.warn(`⚠ WARNING! Conflicting articulations ${articulation1} and ${articulation2} for LSB ${lsb}.`)
    this.#warnedArticulationConflicts.set(lsb, [articulation1, articulation2])
  }

  /**
   * Line parsed callback.
   * @callback lineParsedCallback
   * @param {string} match The full line.
   * @param {...string} groups The matched capture groups.
   * @returns {void}
   */

  /**
   * Parses a line, and if it matches the given regex, calls the given callback
   * with the matched line and any capture groups.
   * @param {string} line The line to parse.
   * @param {RegExp} regex The regex to match to the line.
   * @param {lineParsedCallback} callback The callback function to call if
   * the line is successfully parsed.
   */
  #parseLine (line, regex, callback) {
    if (!line) {
      return
    }
    const match = line.match(regex)
    if (match) {
      callback(...match)
    }
  }

  /**
   * Returns the next unused LSB.
   * @returns {string} The next available LSB.
   */
  getNextFreeLsb () {
    let lsb = this.#lastLsb + 1
    while (this.#lsbArticulations.has(`${lsb}`)) {
      lsb++
    }
    this.#lastLsb = lsb
    return `${lsb}`
  }

  /**
   * Given an LSB, returns a new, modified line, identical to the original but
   * for the new LSB.
   * @callback getNewLineCallback
   * @param {string} lsb The LSB to use to modify the line.
   * @returns {string} The modified line using the given LSB.
   */

  /**
   * Articulation/LSB line parsed callback.
   * @callback lsbLineParsedCallback
   * @param {string} lsb The LSB.
   * @param {string} articulation The articulation name.
   * @param {getNewLineCallback} getNewLine Given an LSB, returns a new,
   * modified line, identical to the original but for the new LSB.
   * @returns {void}
   */

  /**
   * Parses a line, and if it is an LSB definition (`//def-lsb LSB Articulation`),
   * calls the given callback with the matched line, LSB, and articulation.
   * @param {string} line The line to parse.
   * @param {lsbLineParsedCallback} callback The callback function to call if
   * the line is successfully parsed.
   */
  parseDefinition (line, callback) {
    this.#parseLine(line, lsbDefinitionRegex, (_, lsb, articulation, suffix) =>
      callback(lsb, articulation, newLsb => `//def-lsb ${newLsb} ${articulation}${suffix || ''}`)
    )
  }

  /**
   * Parses a line, and if it is an articulation definition (`LSB Articulation`),
   * calls the given callback with the matched line, LSB, and articulation.
   * @param {string} line The line to parse.
   * @param {lsbLineParsedCallback} callback The callback function to call if
   * the line is successfully parsed.
   */
  parseArticulation (line, callback) {
    this.#parseLine(line, articulationRegex, (_, lsb, articulation, suffix) =>
      callback(lsb, articulation, newLsb => `${newLsb} ${articulation}${suffix || ''}`)
    )
  }

  /**
   * Articulation/LSB line updater callback. The LSB in the original line is
   * replaced with the return value.
   * @callback lsbUpdaterCallback
   * @param {string} lsb The LSB.
   * @param {string} articulation The articulation name.
   * @returns {string} The new LSB to update the line with.
   */

  /**
   * Parses a line, and if it is an LSB definition (`//def-lsb LSB Articulation`),
   * calls the given updater callback with the LSB and articulation. The LSB in
   * the original line is replaced with the updater function's return value.
   * @param {string} line The line to parse.
   * @param {lsbUpdaterCallback} updater The updater function to call if
   * the line is successfully parsed.
   */
  updateDefinition (line, updater) {
    let ret = line
    this.parseDefinition(line, (lsb, articulation, getNewLine) => {
      ret = getNewLine(updater(lsb, articulation))
    })
    return ret
  }

  /**
   * Parses a line, and if it is an articulation definition (`LSB Articulation`),
   * calls the given updater callback with the LSB and articulation. The LSB in
   * the original line is replaced with the updater function's return value.
   * @param {string} line The line to parse.
   * @param {lsbUpdaterCallback} updater The updater function to call if
   * the line is successfully parsed.
   */
  updateArticulation (line, updater) {
    let ret = line
    this.parseArticulation(line, (lsb, articulation, getNewLine) => {
      ret = getNewLine(updater(lsb, articulation))
    })
    return ret
  }

  /**
   * Registers an LSB/articulation pair in memory to keep track of which LSBs
   * are assigned to which articulations and vice-versa. In the event of a
   * conflict, the LSB/articulation pair in memory is not changed, and the
   * user is warned.
   * @param {string} lsb The LSB to register.
   * @param {string} articulation The articulation to register.
   */
  registerLsb (lsb, articulation) {
    if (this.#lsbArticulations.has(lsb)) {
      const foundArticulation = this.#lsbArticulations.get(lsb)
      if (articulation !== foundArticulation) {
        this.#warnConflictingArticulation(foundArticulation, articulation, lsb)
      }
    } else {
      this.#lsbArticulations.set(lsb, articulation)
    }

    if (this.#articulationLsbs.has(articulation)) {
      const foundLsb = this.#articulationLsbs.get(articulation)
      if (lsb !== foundLsb) {
        this.#warnConflictingLsb(foundLsb, lsb, articulation)
      }
    } else {
      this.#articulationLsbs.set(articulation, lsb)
    }
  }

  /**
   * Checks whether or not an articulation was registered for the
   * given LSB.
   * @param {string} lsb The LSB.
   */
  hasArticulation (lsb) {
    return this.#lsbArticulations.has(lsb)
  }

  /**
   * Gets the articulation registered for the given LSB.
   * @param {string} lsb The LSB.
   */
  getArticulation (lsb) {
    return this.#lsbArticulations.get(lsb)
  }

  /**
   * Checks whether or not the given LSB was registered for the
   * given articulation.
   * @param {string} articulation The articulation.
   */
  hasLsb (articulation) {
    return this.#articulationLsbs.has(articulation)
  }

  /**
   * Gets the LSB registered for the given articulation.
   * @param {string} articulation The articulation.
   */
  getLsb (articulation) {
    return this.#articulationLsbs.get(articulation)
  }

  /**
   * Returns all registered LSBs and their corresponding articulations.
   * @returns {string[][]} An array of string arrays where the first item in
   * each child array is the LSB and the second is the articulation name.
   */
  registeredLsbs () {
    return [...this.#lsbArticulations.entries()].sort((a, b) => a[0] - b[0])
  }
}
