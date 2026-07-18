export function textModels(models = []) {
  return models.filter((m) => Array.isArray(m.output_modalities) && m.output_modalities.includes('text'))
}

export function sortModels(models = []) {
  const score = (m) => (m.tools ? 2 : 0) + (m.reasoning ? 1 : 0)
  return [...models].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
}

export function modelLabel(m) {
  if (!m) return ''
  const tags = []
  if (m.reasoning) tags.push('reasoning')
  if (m.tools) tags.push('tools')
  return tags.length ? `${m.id} (${tags.join(', ')})` : m.id
}
