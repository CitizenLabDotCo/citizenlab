# frozen_string_literal: true

class UrlValidationService
  URL_WHITELIST = [
    %r{\A(https?)://(.+\.)typeform\.com/to/},
    %r{\A(https?)://surveys.enalyzer.com/?\?pid=.*},
    %r{\A(https?)://(www\.)?survey-xact\.dk/LinkCollector\?key=.*}i,
    %r{\A(https?)://(.+\.)qualtrics\.com/jfe/form/},
    %r{\A(https?)://(www\.)?smartsurvey\.co\.uk/},
    %r{\A(https?)://(.+\.)(microsoft|office)\.com/},
    %r{\A(https?)://(www\.)?eventbrite\.([-A-Z0-9+&@#/%=~_|!:,.;]+)}i,
    %r{\A(https?)://(www\.)?(arcgis|arcg)\.([-A-Z0-9+&@#/%=~_|!:,.;]+)}i,
    %r{\A(https?)://public\.tableau\.com/([-A-Z0-9+&@#/%=~_|!:,.;?]+)}i,
    %r{\A(https?)://datastudio\.google\.com/embed/},
    %r{\A(https?)://app\.powerbi\.com/},
    %r{\A(https?)://static\.ctctcdn\.com/js/},
    %r{\A(https?)://(www\.)?instagram\.com/},
    %r{\A(https?)://platform\.twitter\.com/},
    %r{\A(https?)://.+\.konveio\.com/},
    %r{\A(https?)://(www\.)?facebook\.com/},
    %r{\A(https?)://(.+\.)(welcomesyourfeedback.net|snapsurveys.com)/},
    %r{\A(https?)://([-A-Z0-9.]+)\.surveymonkey\.([-A-Z0-9+&@#/%=~_|!:,.;]+)}i,
    %r{\A(https?)://docs\.google\.com/(document|spreadsheets|forms|presentation)/d/(.*?)/.*?},
    %r{\A(https?)://(www\.)?google\.com/maps(/[a-z])?/embed\?([^&]*)=([-A-Z0-9+&@#/%=~_|!:,.;]+)}i,
    %r{\A(https?)://([-A-Z0-9.]+)\.slideshare(\.(net|com))/slideshow/embed_code/key/([-A-Z0-9+&@#/%=~_|!:,.;]+)}i,
    %r{\A(https?)://(www\.)?onedrive\.live\.([-A-Z0-9+&@#/%=~_|!:,.;?]+)}i,
    %r{\A(https?)://.*pdf$},
    %r{\A(https?)://(.+\.)abalancingact\.com}
  ].freeze

  VIDEO_WHITELIST = [
    %r{\A(?:http(?:s?):)?//(?:www\.)?youtu(?:be\.com/(?:watch\?v=|embed/)|\.be/)([\w\-_]*)},
    %r{\A(?:http(?:s?):)?//(?:www\.)?player\.vimeo\.(com/video|vimeo\.com)/(\d+)(?:|/\?)},
    %r{\A(?:http(?:s?):)?//(.+)?(wistia.com|wi.st).*/},
    %r{\A(?:http(?:s?):)?//(?:www\.)?dailymotion\.com/embed/video/?(.+)},
    %r{\A(https?://)?media\.videotool\.dk/?\?vn=[\w-]+},
    %r{\A(https?://)(?:www\.)?dreambroker\.com/channel/([\w-]+)/iframe/([\w\-\#/]+)}
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
