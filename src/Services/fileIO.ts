export const loadFile = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsBinaryString(file)
  reader.onloadend = function () {
    if (typeof reader.result === 'string') {
      resolve(reader.result)
    }
  }
  reader.onerror = function () {
    reject('Could not read file')
  }
  reader.onabort = function () {
    reject('Could not read file')
  }
})