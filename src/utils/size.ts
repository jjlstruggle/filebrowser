export default function size(limit: number) {
  let size = "";
  if (limit < 0.1 * 1024) {
    size = limit.toFixed(2) + "B";
  } else if (limit < 0.1 * 1024 * 1024) {
    size = (limit / 1024).toFixed(2) + "KB";
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    size = (limit / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  let sizestr = size + "";
  let len = sizestr.indexOf(".");
  let dec = sizestr.substr(len + 1, 2);
  if (dec == "00") {
    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
  }
  return sizestr;
}
