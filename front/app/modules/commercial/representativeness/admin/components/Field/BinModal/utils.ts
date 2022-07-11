export const formatRange = (range: [number, number], andOverString) => {
  return isFinite(range[1])
    ? `${range[0]}-${range[1]}`
    : `${range[0]} ${andOverString}`
}