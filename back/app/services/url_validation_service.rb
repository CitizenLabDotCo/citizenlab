# frozen_string_literal: true

class UrlValidationService
  VIDEO_WHITELIST = [
    %r{\A(?:http(?:s?):)?//(?:www\.)?youtu(?:be\.com/(?:watch\?v=|embed/)|\.be/)([\w\-_]*)},
    %r{\A(?:http(?:s?):)?//(?:www\.)?player\.vimeo\.(com/video|vimeo\.com)/(\d+)(?:|/\?)},
    %r{\A(?:http(?:s?):)?//(.+)?(wistia.com|wi.st).*/},
    %r{\A(?:http(?:s?):)?//(?:www\.)?dailymotion\.com/embed/video/?(.+)},
    %r{\A(https?://)?media\.videotool\.dk/?\?vn=[\w-]+},
    %r{\A(https?://)(?:www\.)?dreambroker\.com/channel/([\w-]+)/iframe/([\w\-\#/]+)},
    %r{\A(?:http(?:s?):)?//(?:www\.)?videoask\.com/([\w\-_]+)}
  ].freeze

  def video_whitelisted?(url)
    VIDEO_WHITELIST.any? { |regex| regex.match? url }
  end
end
