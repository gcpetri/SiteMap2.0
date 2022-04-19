export const regExpFlags: string = 'gsi';

export const generateRegexStr = (regexItems:string[]):string|null => {
  let regexStr: string = '';
  regexItems.forEach((item:string, index:number) => {
    index === regexItems.length - 1 ? regexStr += item : regexStr += `${item}|`;
  });
  return regexStr.length > 0 ? regexStr : null;
};