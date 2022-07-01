# frozen_string_literal: true

class UrlValidationService
  # Changed the format of these to them similar to those in the frontend
  # This will make it easy to maintain them.
  URL_WHITELIST = [
    /^(https?):\/\/(.+\.)typeform\.com\/to\//,
    /^(https?):\/\/surveys.enalyzer.com\/?\?pid=.*/,
    /^(https?):\/\/(www\.)?survey-xact\.dk\/LinkCollector\?key=.*/i,
    /^(https?):\/\/(.+\.)qualtrics\.com\/jfe\/form\//,
    /^(https?):\/\/(www\.)?smartsurvey\.co\.uk\//,
    /^(https?):\/\/(.+\.)(microsoft|office)\.com\//,
    /^(https?):\/\/(www\.)?eventbrite\.([-A-Z0-9+&@#\/%=~_|!:,.;]+)/i,
    /^(https?):\/\/(www\.)?(arcgis|arcg)\.([-A-Z0-9+&@#\/%=~_|!:,.;]+)/i,
    /^(https?):\/\/public\.tableau\.com\/([-A-Z0-9+&@#\/%=~_|!:,.;?]+)/i,
    /^(https?):\/\/datastudio\.google\.com\/embed\//,
    /^(https?):\/\/app\.powerbi\.com\//,
    /^(https?):\/\/static\.ctctcdn\.com\/js\//,
    /^(https?):\/\/(www\.)?instagram\.com\//,
    /^(https?):\/\/platform\.twitter\.com\//,
    /^(https?):\/\/.+\.konveio\.com\//,
    /^(https?):\/\/(www\.)?facebook\.com\//,
    /^(https?):\/\/(.+\.)(welcomesyourfeedback.net|snapsurveys.com)\//,
    /^(https?):\/\/([-A-Z0-9.]+)\.surveymonkey\.([-A-Z0-9+&@#\/%=~_|!:,.;]+)/i,
    /^(https?):\/\/docs\.google\.com\/(document|spreadsheets|forms|presentation)\/d\/(.*?)\/.*?/,
    /^(https?):\/\/(www\.)?google\.com\/maps(\/[a-z])?\/embed\?([^&]*)=([-A-Z0-9+&@#\/%=~_|!:,.;]+)/i,
    /^(https?):\/\/([-A-Z0-9.]+)\.slideshare(\.(net|com))\/slideshow\/embed_code\/key\/([-A-Z0-9+&@#\/%=~_|!:,.;]+)/i,
    /^(https?):\/\/(www\.)?onedrive\.live\.([-A-Z0-9+&@#\/%=~_|!:,.;?]+)/i
  ].freeze

  VIDEO_WHITELIST = [
    /^(https?):\/\/(?:www\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/)|\.be\/)([\w\-_]*)/,
    /^(https?):\/\/(?:www\.)?(?:player\.vimeo\.com\/video|vimeo\.com)\/(\d+)(?:|\/\?)/,
    /^(https?):\/\/(.+)?(wistia\.com|wi\.st)\/.*\//,
    /^(https?):\/\/(?:www\.)?dailymotion\.com\/embed\/video\/?(.+)/,
    /^(https?):\/\/?media\.videotool\.dk\/?\?vn=[\w-]+/,
    /^(https?):\/\/(?:www\.)?dreambroker\.com\/channel\/([\w-]+)\/iframe\//
  ].freeze

  def whitelisted?(url)
    url_whitelisted?(url) || video_whitelisted?(url)
  end

  def url_whitelisted?(url)
    URL_WHITELIST.any? { |regex| regex.match? url }
  end

  def video_whitelisted?(url)
    VIDEO_WHITELIST.any? { |regex| regex.match? url }
  end
end
