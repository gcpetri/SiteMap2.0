export const isOnScreen = (element: HTMLElement): boolean => {
  const curTop = element.offsetTop
  console.log(curTop)
  const screenHeight = window.screen.height
  console.log(screenHeight)
  return (curTop > screenHeight) ? false : true
}

export const focusOnMatch = (ele: any) => {
  console.log(ele)
}