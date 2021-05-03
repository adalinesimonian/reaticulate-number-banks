import ReabankParser from './reabank-parser.js'
import {jest} from '@jest/globals'

/**
 * The parser to test.
 * @type {ReabankParser}
 */
let parser

beforeEach(() => {
  parser = new ReabankParser()
})

describe('parsing', () => {
  const mockCallback = jest.fn()

  afterEach(() => {
    mockCallback.mockClear()
  })

  describe('definitions', () => {
    describe('with valid definition lines', () => {
      beforeEach(() => {
        parser.parseDefinition('//def-lsb 1 Articulation A', mockCallback)
      })

      test('should call callback once', () => {
        expect(mockCallback).toHaveBeenCalledTimes(1)
      })

      test('should pass properly parsed LSB to callback', () => {
        expect(mockCallback.mock.calls[0][0]).toBe('1')
      })

      test('should pass properly parsed articulation name to callback', () => {
        expect(mockCallback.mock.calls[0][1]).toBe('Articulation A')
      })

      test('should pass getNewLine function to callback', () => {
        expect(typeof mockCallback.mock.calls[0][2]).toBe('function')
      })

      test('getNewLine function should return correctly updated line', () => {
        expect(mockCallback.mock.calls[0][2]('3'))
          .toBe('//def-lsb 3 Articulation A')
      })
    })

    describe('with definition lines with a bad tag', () => {
      test('should not call callback', () => {
        parser.parseDefinition('//def-lsbX 1 Articulation A', mockCallback)
        expect(mockCallback).not.toBeCalled()
      })
    })

    describe('with definition lines with a bad LSB', () => {
      test('should not call callback', () => {
        parser.parseDefinition('//def-lsb X Articulation A', mockCallback)
        expect(mockCallback).not.toBeCalled()
      })
    })

    describe('with definition lines with a bad articulation name', () => {
      test('should not call callback', () => {
        parser.parseDefinition('//def-lsb 1', mockCallback)
        expect(mockCallback).not.toBeCalled()
      })
    })
  })

  describe('articulations', () => {
    describe('with valid articulation lines', () => {
      beforeEach(() => {
        parser.parseArticulation('1 Articulation A', mockCallback)
      })

      test('should call callback once', () => {
        expect(mockCallback).toHaveBeenCalledTimes(1)
      })

      test('should pass properly parsed LSB to callback', () => {
        expect(mockCallback.mock.calls[0][0]).toBe('1')
      })

      test('should pass properly parsed articulation name to callback', () => {
        expect(mockCallback.mock.calls[0][1]).toBe('Articulation A')
      })

      test('should pass getNewLine function to callback', () => {
        expect(typeof mockCallback.mock.calls[0][2]).toBe('function')
      })

      test('getNewLine function should return correctly updated line', () => {
        expect(mockCallback.mock.calls[0][2]('3'))
          .toBe('3 Articulation A')
      })
    })

    describe('with articulation lines with a bad LSB', () => {
      test('should not call callback', () => {
        parser.parseArticulation('X Articulation A', mockCallback)
        expect(mockCallback).not.toBeCalled()
      })
    })

    describe('with articulation lines with a bad articulation name', () => {
      test('should not call callback', () => {
        parser.parseArticulation('1', mockCallback)
        expect(mockCallback).not.toBeCalled()
      })
    })
  })
})

describe('updating', () => {
  const mockUpdater = jest.fn(() => '3')

  afterEach(() => {
    mockUpdater.mockClear()
  })

  describe('definitions', () => {
    describe('with valid definition lines', () => {
      /**
       * Updated definition line returned from update function.
       * @type {string}
       */
      let newLine

      beforeEach(() => {
        newLine = parser.updateDefinition('//def-lsb 1 Articulation A', mockUpdater)
      })

      test('should call updater once', () => {
        expect(mockUpdater).toHaveBeenCalledTimes(1)
      })

      test('should pass properly parsed LSB to updater', () => {
        expect(mockUpdater.mock.calls[0][0]).toBe('1')
      })

      test('should pass properly parsed articulation name to updater', () => {
        expect(mockUpdater.mock.calls[0][1]).toBe('Articulation A')
      })

      test('should return updated line using updater return value', () => {
        expect(newLine).toBe('//def-lsb 3 Articulation A')
      })
    })

    describe('with definition lines with a bad tag', () => {
      test('should not call updater', () => {
        parser.updateDefinition('//def-lsbX 1 Articulation A', mockUpdater)
        expect(mockUpdater).not.toBeCalled()
      })
    })

    describe('with definition lines with a bad LSB', () => {
      test('should not call updater', () => {
        parser.updateDefinition('//def-lsb X Articulation A', mockUpdater)
        expect(mockUpdater).not.toBeCalled()
      })
    })

    describe('with definition lines with a bad articulation name', () => {
      test('should not call updater', () => {
        parser.updateDefinition('//def-lsb 1', mockUpdater)
        expect(mockUpdater).not.toBeCalled()
      })
    })
  })

  describe('articulations', () => {
    describe('with valid articulation lines', () => {
      /**
       * Updated articulation line returned from update function.
       * @type {string}
       */
      let newLine

      beforeEach(() => {
        newLine = parser.updateArticulation('1 Articulation A', mockUpdater)
      })

      test('should call updater once', () => {
        expect(mockUpdater).toHaveBeenCalledTimes(1)
      })

      test('should pass properly parsed LSB to updater', () => {
        expect(mockUpdater.mock.calls[0][0]).toBe('1')
      })

      test('should pass properly parsed articulation name to updater', () => {
        expect(mockUpdater.mock.calls[0][1]).toBe('Articulation A')
      })

      test('should return updated line using updater return value', () => {
        expect(newLine).toBe('3 Articulation A')
      })
    })

    describe('with articulation lines with a bad LSB', () => {
      test('should not call updater', () => {
        parser.updateArticulation('X Articulation A', mockUpdater)
        expect(mockUpdater).not.toBeCalled()
      })
    })

    describe('with articulation lines with a bad articulation name', () => {
      test('should not call updater', () => {
        parser.updateArticulation('1', mockUpdater)
        expect(mockUpdater).not.toBeCalled()
      })
    })
  })
})

describe('registrations', () => {
  let spy

  beforeAll(() => {
    spy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  afterEach(() => {
    spy.mockClear()
  })

  test('should register LSBs', () => {
    parser.registerLsb('1', 'Articulation A')
    parser.registerLsb('2', 'Articulation B')
    expect(parser.registeredLsbs()).toEqual([
      ['1', 'Articulation A'],
      ['2', 'Articulation B']
    ])
  })

  test('should not register conflicting LSBs', () => {
    parser.registerLsb('1', 'Articulation A')
    parser.registerLsb('2', 'Articulation B')
    parser.registerLsb('2', 'Articulation C')
    expect(parser.registeredLsbs()).toEqual([
      ['1', 'Articulation A'],
      ['2', 'Articulation B']
    ])
  })

  test('should warn user when attempting to register conflicting LSBs', () => {
    parser.registerLsb('1', 'Articulation A')
    parser.registerLsb('2', 'Articulation B')
    parser.registerLsb('2', 'Articulation C')
    expect(console.warn).toBeCalled()
  })
})

describe('has/get functions', () => {
  beforeEach(() => {
    parser.registerLsb('1', 'Articulation A')
    parser.registerLsb('2', 'Articulation B')
    parser.registerLsb('4', 'Articulation C')
  })

  describe('articulations', () => {
    test('has should be true for registered LSBs', () => {
      expect(parser.hasArticulation('1')).toBe(true)
    })

    test('has should be false for unregistered LSBs', () => {
      expect(parser.hasArticulation('3')).toBe(false)
    })

    test('get should return correct articulation for registered LSB', () => {
      expect(parser.getArticulation('1')).toBe('Articulation A')
    })

    test('get should return undefined for unregistered LSB', () => {
      expect(parser.getArticulation('3')).toBe(undefined)
    })
  })

  describe('LSBs', () => {
    test('has should be true for registered articulations', () => {
      expect(parser.hasLsb('Articulation A')).toBe(true)
    })

    test('has should be false for unregistered articulations', () => {
      expect(parser.hasLsb('Articulation D')).toBe(false)
    })

    test('get should return correct LSB for registered articulation', () => {
      expect(parser.getLsb('Articulation A')).toBe('1')
    })

    test('get should return undefined for unregistered articulation', () => {
      expect(parser.getLsb('Articulation D')).toBe(undefined)
    })
  })
})

describe('lsb numbering', () => {
  describe('with no articulations registered', () => {
    test('should sequentially number LSBs', () => {
      expect(parser.getNextFreeLsb()).toBe('1')
      expect(parser.getNextFreeLsb()).toBe('2')
    })
  })

  describe('with articulations registered', () => {
    test('should sequentially number LSBs without conflicts', () => {
      parser.registerLsb('1', 'Articulation A')
      parser.registerLsb('2', 'Articulation B')
      parser.registerLsb('4', 'Articulation C')

      expect(parser.getNextFreeLsb()).toBe('3')
      expect(parser.getNextFreeLsb()).toBe('5')
      expect(parser.getNextFreeLsb()).toBe('6')
    })
  })
})
