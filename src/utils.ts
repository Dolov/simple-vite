
export const getExt = (name: string) => {
  if (!name) return ""
  if (!name.includes(".")) return name
  const fg = name.split(".")
  return fg[fg.length - 1].replace(/\?.*/, "")
}

export const getSrc = (html: string) => {
  if (!html) return
  const scriptRes = html.match(/<script(.*)type=("|')module("|')(.*)>(.*)<\/script>/)
  if (!scriptRes) return
  const srcRes = scriptRes[0].match(/src=("|')(.*)("|')/)
  if (!srcRes) return
  const path = srcRes[2].startsWith("/") ? srcRes[2]: `/${srcRes[2]}`
  const src = path.split("/")[1]
  if (src.includes(".")) return "/"
  return `/${src}`
}