import ReabankNumberer from './reabank-numberer.js'
import {jest} from '@jest/globals'

describe('instantiation', () => {
  describe('when data not passed', () => {
    test('should throw error', () => {
      expect(() => new ReabankNumberer()).toThrow()
    })
  })

  describe('when passed data of type other than string', () => {
    test('should throw error', () => {
      expect(() => new ReabankNumberer(25)).toThrow()
      expect(() => new ReabankNumberer([])).toThrow()
      expect(() => new ReabankNumberer({})).toThrow()
    })
  })

  describe('when passed string data', () => {
    test('should not throw error', () => {
      expect(() => new ReabankNumberer('data')).not.toThrow()
    })

    describe('when debug flag not passed', () => {
      test('debug should default to false', () => {
        expect(new ReabankNumberer('data').debug).toBe(false)
      })
    })

    describe('when debug flag passed', () => {
      test('debug should be set to passed value', () => {
        expect(
          new ReabankNumberer('data', true).debug
        ).toBe(true)
      })

      describe('when logger not passed', () => {
        test('logger should default to console.log', () => {
          expect(
            new ReabankNumberer('data', true).logger
          ).toBe(console.log)
        })
      })

      describe('when passed logger', () => {
        test('logger should be set to passed value', () => {
          const mockLogger = () => {}
          expect(
            new ReabankNumberer('data', true, mockLogger).logger
          ).toBe(mockLogger)
        })
      })
    })
  })
})

describe('logging', () => {
  let spy

  beforeAll(() => {
    spy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  afterEach(() => {
    spy.mockClear()
  })

  describe('when debug is false', () => {
    test('should not log updates', () => {
      new ReabankNumberer('data').numberLsbs()
      expect(spy).not.toBeCalled()
    })
  })

  describe('when debug is true', () => {
    describe('when logger not passed', () => {
      test('should log updates straight to console', () => {
        new ReabankNumberer('data', true).numberLsbs()
        expect(spy).toBeCalled()
      })
    })

    describe('when passed logger', () => {
      test('should log updates using provided logger', () => {
        const mockLogger = jest.fn()
        new ReabankNumberer('data', true, mockLogger).numberLsbs()
        expect(mockLogger).toBeCalled()
      })
    })
  })
})

const reabankInput = `
//-------------------------
// Source: user - https://forum.cockos.com/showpost.php?p=123456789&postcount=100
//
// def-lsb 1 Articulation A
//def-lsbX 1 Articulation A
//def-lsb X Articulation A
//def-lsb 7
//def-lsb 5 Articulation A
//def-lsb 0 Articulation B

//! g="Publisher/Library" n="Instrument 1"
//! m="Informational Message"
Bank 1 1 PB-LB - Instrument 1 Multi
//! c=short-dark i=pizz o=@1
1 Articulation A
//! c=legato i=legato o=@2
2 Articulation B
//! c=short-light i=staccato o=note@3:24
17 Articulation C - C1
//! c=short i=spiccato o=note@3:25
15 Articulation D - C#1
//def-lsb 1 Articulation C
//def-lsb 0 Articulation D
//! c=long-dark i=accented-quarter o=note@3:26
22 Articulation E - D1
//! c=short-light i=tremolo-measured o=note@3:27
0 Articulation F - D#1
`

const reabankOutputDefault = `
//-------------------------
// Source: user - https://forum.cockos.com/showpost.php?p=123456789&postcount=100
//
// def-lsb 1 Articulation A
//def-lsbX 1 Articulation A
//def-lsb X Articulation A
//def-lsb 7
//def-lsb 5 Articulation A
//def-lsb 2 Articulation B

//! g="Publisher/Library" n="Instrument 1"
//! m="Informational Message"
Bank 1 1 PB-LB - Instrument 1 Multi
//! c=short-dark i=pizz o=@1
5 Articulation A
//! c=legato i=legato o=@2
2 Articulation B
//! c=short-light i=staccato o=note@3:24
1 Articulation C - C1
//! c=short i=spiccato o=note@3:25
3 Articulation D - C#1
//def-lsb 1 Articulation C
//def-lsb 3 Articulation D
//! c=long-dark i=accented-quarter o=note@3:26
4 Articulation E - D1
//! c=short-light i=tremolo-measured o=note@3:27
6 Articulation F - D#1
`

const reabankMappingDefault = [
  ['1', 'Articulation C'],
  ['2', 'Articulation B'],
  ['3', 'Articulation D'],
  ['4', 'Articulation E'],
  ['5', 'Articulation A'],
  ['6', 'Articulation F'],
]

const reabankOutputMaintain = `
//-------------------------
// Source: user - https://forum.cockos.com/showpost.php?p=123456789&postcount=100
//
// def-lsb 1 Articulation A
//def-lsbX 1 Articulation A
//def-lsb X Articulation A
//def-lsb 7
//def-lsb 5 Articulation A
//def-lsb 2 Articulation B

//! g="Publisher/Library" n="Instrument 1"
//! m="Informational Message"
Bank 1 1 PB-LB - Instrument 1 Multi
//! c=short-dark i=pizz o=@1
1 Articulation A
//! c=legato i=legato o=@2
2 Articulation B
//! c=short-light i=staccato o=note@3:24
17 Articulation C - C1
//! c=short i=spiccato o=note@3:25
15 Articulation D - C#1
//def-lsb 1 Articulation C
//def-lsb 3 Articulation D
//! c=long-dark i=accented-quarter o=note@3:26
22 Articulation E - D1
//! c=short-light i=tremolo-measured o=note@3:27
4 Articulation F - D#1
`

const reabankMappingMaintain = [
  ['1', 'Articulation C'],
  ['2', 'Articulation B'],
  ['3', 'Articulation D'],
  ['4', 'Articulation F'],
  ['5', 'Articulation A'],
  ['15', 'Articulation D'],
  ['17', 'Articulation C'],
  ['22', 'Articulation E']
]

const reabankOutputRenumberDefs = `
//-------------------------
// Source: user - https://forum.cockos.com/showpost.php?p=123456789&postcount=100
//
// def-lsb 1 Articulation A
//def-lsbX 1 Articulation A
//def-lsb X Articulation A
//def-lsb 7
//def-lsb 1 Articulation A
//def-lsb 2 Articulation B

//! g="Publisher/Library" n="Instrument 1"
//! m="Informational Message"
Bank 1 1 PB-LB - Instrument 1 Multi
//! c=short-dark i=pizz o=@1
1 Articulation A
//! c=legato i=legato o=@2
2 Articulation B
//! c=short-light i=staccato o=note@3:24
3 Articulation C - C1
//! c=short i=spiccato o=note@3:25
4 Articulation D - C#1
//def-lsb 3 Articulation C
//def-lsb 4 Articulation D
//! c=long-dark i=accented-quarter o=note@3:26
5 Articulation E - D1
//! c=short-light i=tremolo-measured o=note@3:27
6 Articulation F - D#1
`

const reabankMappingRenumberDefs = [
  ['1', 'Articulation A'],
  ['2', 'Articulation B'],
  ['3', 'Articulation C'],
  ['4', 'Articulation D'],
  ['5', 'Articulation E'],
  ['6', 'Articulation F']
]

const reabankOutputMaintainRenumberDefs = `
//-------------------------
// Source: user - https://forum.cockos.com/showpost.php?p=123456789&postcount=100
//
// def-lsb 1 Articulation A
//def-lsbX 1 Articulation A
//def-lsb X Articulation A
//def-lsb 7
//def-lsb 1 Articulation A
//def-lsb 2 Articulation B

//! g="Publisher/Library" n="Instrument 1"
//! m="Informational Message"
Bank 1 1 PB-LB - Instrument 1 Multi
//! c=short-dark i=pizz o=@1
1 Articulation A
//! c=legato i=legato o=@2
2 Articulation B
//! c=short-light i=staccato o=note@3:24
17 Articulation C - C1
//! c=short i=spiccato o=note@3:25
15 Articulation D - C#1
//def-lsb 3 Articulation C
//def-lsb 4 Articulation D
//! c=long-dark i=accented-quarter o=note@3:26
22 Articulation E - D1
//! c=short-light i=tremolo-measured o=note@3:27
5 Articulation F - D#1
`

const reabankMappingMaintainRenumberDefs = [
  ['1', 'Articulation A'],
  ['2', 'Articulation B'],
  ['3', 'Articulation C'],
  ['4', 'Articulation D'],
  ['5', 'Articulation F'],
  ['15', 'Articulation D'],
  ['17', 'Articulation C'],
  ['22', 'Articulation E']
]

describe('lsb numbering', () => {
  let spy
  /**
   * The numberer to test.
   * @type {ReabankNumberer}
   */
  let numberer

  beforeAll(() => {
    spy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  beforeEach(() => {
    numberer = new ReabankNumberer(reabankInput)
  })

  afterEach(() => {
    spy.mockClear()
  })

  describe('with default parameters', () => {
    test('should renumber uninitialized definitions and all articulations', () => {
      numberer.numberLsbs()
      expect(numberer.output()).toBe(reabankOutputDefault)
      expect(numberer.articulations()).toEqual(reabankMappingDefault)
    })
  })

  describe('with maintain true, renumberDefinitions false', () => {
    test('should renumber uninitialized definitions and articulations', () => {
      numberer.numberLsbs(true)
      expect(numberer.output()).toBe(reabankOutputMaintain)
      expect(numberer.articulations()).toEqual(reabankMappingMaintain)
    })
  })

  describe('with maintain false, renumberDefinitions true', () => {
    test('should renumber all definitions and articulations', () => {
      numberer.numberLsbs(false, true)
      expect(numberer.output()).toBe(reabankOutputRenumberDefs)
      expect(numberer.articulations()).toEqual(reabankMappingRenumberDefs)
    })
  })

  describe('with maintain true, renumberDefinitions true', () => {
    test('should renumber all definitions and uninitialized articulations', () => {
      numberer.numberLsbs(true, true)
      expect(numberer.output()).toBe(reabankOutputMaintainRenumberDefs)
      expect(numberer.articulations()).toEqual(reabankMappingMaintainRenumberDefs)
    })
  })
})
