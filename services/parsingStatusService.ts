import { ParsingStatus } from '@/utils/types'
import { storage } from '#imports'

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
