import { ParsingStatus } from '@/utils/types'
import { storage } from '#imports'

/**
 * Gets the parsing status from local storage
 * @returns The parsing status
 */
export async function getParsingStatus(): Promise<ParsingStatus | null> {
  return await storage.getItem<ParsingStatus>('local:parsingStatus')
}

/**
 * Updates the parsing status in local storage
 * @param status - The status to update
 */
export async function updateParsingStatus({
  status,
  hostname,
}: {
  status: Omit<ParsingStatus, 'site' | 'timestamp'>
  hostname: string
}) {
  await storage.setItem<ParsingStatus>('local:parsingStatus', {
    ...status,
    site: hostname,
    timestamp: Date.now(),
  })
}

/**
 * Sets up a listener for changes to the parsing status in local storage
 * @param callback - The callback to call when the parsing status changes
 */
export function setupParsingStatusListener(callback: (status: ParsingStatus | null) => void) {
  storage.watch('local:parsingStatus', callback)
}
