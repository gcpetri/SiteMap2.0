export const downloadJsonFile = async (jsonObj:any) => {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj, null, 4)));
  element.setAttribute('download', `json-data-${Date.now()}.json`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const downloadKmlFile = async (kmlStr:string) => {
  console.log('downloading kml');
  const element = document.createElement('a');
  const blob = new Blob([kmlStr], {type: 'text/plain'});
  element.setAttribute('href', URL.createObjectURL(blob));
  element.setAttribute('download', `kml-${Date.now()}.kml`);
  element.dataset.downloadurl = ['text/plain', element.download, element.href].join(':');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};