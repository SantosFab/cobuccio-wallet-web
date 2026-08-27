// First letter of the first name + last letter of the last surname —
// e.g. "Fabricio dos Santos" -> "FS" (not "FD", which is what taking the
// first letter of the first two words would give).
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  const first = words[0][0]
  if (words.length === 1) return first.toUpperCase()

  const lastWord = words[words.length - 1]
  const last = lastWord[lastWord.length - 1]

  return (first + last).toUpperCase()
}
