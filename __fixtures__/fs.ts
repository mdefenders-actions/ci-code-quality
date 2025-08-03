import type * as fs from 'fs/promises'
import { jest } from '@jest/globals'

export const access = jest.fn<typeof fs.access>()
export const readFile = jest.fn<typeof fs.readFile>()
