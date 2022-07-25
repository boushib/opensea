export const formatToK = (n: number) => {
  console.log(n)
  return n < 1000 ? n.toFixed(2) : `${Math.round(n / 1000).toFixed(1)}k`
}
