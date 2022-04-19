export const downloadKmzFile = async (zip:any) => {
  await zip.generateAsync({type: 'blob'}).then((content:Blob) => {
    const element = document.createElement('a');
    element.setAttribute('href', URL.createObjectURL(content));
    element.setAttribute('download', `rock-jobs-${Date.now()}.kmz`);
    element.dataset.downloadurl = ['application/vnd', element.download, element.href].join(':');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
};