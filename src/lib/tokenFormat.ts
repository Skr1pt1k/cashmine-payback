/** HTTP header values must be visible ASCII; anything else makes fetch throw before sending. */
export function isValidTokenFormat(token: string): boolean {
  return /^[\x21-\x7E]+$/.test(token);
}
