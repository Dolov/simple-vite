
export const getExt = (name: string) => {
  if (!name) return ""
  if (!name.includes(".")) return name
  const fg = name.split(".")
  return fg[fg.length - 1].replace(/\?.*/, "")
}