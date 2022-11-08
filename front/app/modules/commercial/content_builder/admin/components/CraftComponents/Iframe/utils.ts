const urlWhiteList = [
  /^(https?):\/\/(.+\.)typeform\.com\/to\//,
  /^(https?):\/\/surveys.enalyzer.com\/?\?pid=.*/,
  /^(https?):\/\/(www\.)?survey-xact\.dk\/LinkCollector\?key=.*/i,
  /^(https?):\/\/(.+\.)qualtrics\.com\/jfe\/form\//,
  /^(https?):\/\/(www\.)?smartsurvey\.co\.uk\//,
  /^(https?):\/\/(.+\.)(microsoft|office)\.com\//,
  /^(https?):\/\/(www\.)?eventbrite\.([-A-Z0-9+&@#/%=~_|!:,.;]+)/i,
  /^(https?):\/\/(www\.)?(arcgis|arcg)\.([-A-Z0-9+&@#/%=~_|!:,.;]+)/i,
  /^(https?):\/\/public\.tableau\.com\/([-A-Z0-9+&@#/%=~_|!:,.;?]+)/i,
  /^(https?):\/\/datastudio\.google\.com\/embed\//,
  /^(https?):\/\/app\.powerbi\.com\//,
  /^(https?):\/\/static\.ctctcdn\.com\/js\//,
  /^(https?):\/\/(www\.)?instagram\.com\//,
  /^(https?):\/\/platform\.twitter\.com\//,
  /^(https?):\/\/.+\.konveio\.com\//,
  /^(https?):\/\/(www\.)?facebook\.com\//,
  /^(https?):\/\/(?:www\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/)|\.be\/)([\w\-_]*)/,
  /^(https?):\/\/(?:www\.)?player\.vimeo\.(com\/video|vimeo\.com)\/(\d+)(?:|\/\?)/,
  /^(https?):\/\/(?:www\.)?dailymotion\.com\/embed\/video\/?(.+)/,
  /^(https?):\/\/?media\.videotool\.dk\/?\?vn=[\w-]+/,
  /^(https?):\/\/(?:www\.)?dreambroker\.com\/channel\/([\w-]+)\/iframe\//,
  /^(https?):\/\/(.+)?(wistia\.com|wi\.st)\/.*\//,
  /^(https?):\/\/(.+\.)(welcomesyourfeedback.net|snapsurveys.com)\//,
  /^(https?):\/\/([-A-Z0-9.]+)\.surveymonkey\.([-A-Z0-9+&@#/%=~_|!:,.;]+)/i,
  /^(https?):\/\/docs\.google\.com\/(document|spreadsheets|forms|presentation)\/d\/(.*?)\/.*?/,
  /^(https?):\/\/(www\.)?google\.com\/maps(\/[a-z])?\/embed\?([^&]*)=([-A-Z0-9+&@#/%=~_|!:,.;]+)/i,
  /^(https?):\/\/([-A-Z0-9.]+)\.slideshare(\.(net|com))\/slideshow\/embed_code\/key\/([-A-Z0-9+&@#/%=~_|!:,.;]+)/i,
  /^(https?):\/\/(www\.)?onedrive\.live\.([-A-Z0-9+&@#/%=~_|!:,.;?]+)/i,
  /^(https?):\/\/(.+\.)abalancingact\.com/i,
  /^(https?):\/\/.*pdf$/,
];

/*
 * Function to validate embed URL against white list
 * Returns: boolean value whether URL input string is valid or not
 */
export const isValidUrl = (url: string) => {
  // Used this reference for generating a valid URL regex:
  // https://tutorial.eyehunts.com/js/url-regex-validation-javascript-example-code/
  const validUrlRegex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

  if (!validUrlRegex.test(url)) {
    return [false, 'invalidUrl'];
  }

  const isAcceptableUrl = urlWhiteList.some((rx) => rx.test(url));

  return [isAcceptableUrl, 'whitelist'];
};
