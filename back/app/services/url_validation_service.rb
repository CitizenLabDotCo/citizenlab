# frozen_string_literal: true

class UrlValidationService
    URL_WHITELIST = [
      %r{\Ahttps:\/\/(.+\.)typeform\.com\/to\/},
      %r{\Ahttps:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js},
      %r{\Ahttps:\/\/docs.google.com\/forms\/d\/e\/.*\/viewform\?embedded=true},
      %r{\Ahttps:\/\/surveys.enalyzer.com\/?\?pid=.*},
      %r{\Ahttps:\/\/(www\.)?survey-xact\.dk\/LinkCollector\?key=.*},
      %r{\Ahttps:\/\/(.+\.)qualtrics\.com\/jfe\/form\/},
      %r{\Ahttps:\/\/(www\.)?smartsurvey\.co\.uk\/},
      %r{\Ahttps:\/\/(.+\.)(microsoft|office)\.com\/},
      %r{\Ahttps:\/\/(www\.)?eventbrite\.com\/static\/widgets\/},
      %r{\Ahttps:\/\/(www\.)?arcgis\.com\/},
      %r{\Ahttps:\/\/public\.tableau\.com\/},
      %r{\Ahttps:\/\/datastudio\.google\.com\/embed\/},
      %r{\Ahttps:\/\/app\.powerbi\.com\/},
      %r{\Ahttps:\/\/static\.ctctcdn\.com\/js\/},
      %r{\Ahttps:\/\/(www\.)?instagram\.com\/},
      %r{\Ahttps:\/\/platform\.twitter\.com\/},
      %r{\Ahttps:\/\/.+\.konveio\.com\/},
      %r{\Ahttps:\/\/(www\.)?facebook\.com\/}
    ].freeze

    VIDEO_WHITELIST = [
      %r{\A(?:http(?:s?):)?//(?:www\.)?youtu(?:be\.com/(?:watch\?v=|embed/)|\.be/)([\w\-\_]*)},
      %r{\A(?:http(?:s?):)?//(?:www\.)?(?:player\.vimeo\.com/video|vimeo\.com)/(\d+)(?:|/\?)},
      %r{\A(?:http(?:s?):)?//(.+)?(wistia.com|wi.st).*\/},
      %r{\A(?:http(?:s?):)?//(?:www\.)?dailymotion\.com/embed/video/?(.+)},
      %r{\A(https?://)?media\.videotool\.dk/?\?vn=[\w-]+},
      %r{\A(https?://)(?:www\.)?dreambroker\.com/channel/([\w-]+)/iframe/([\w\-\#\/]+)}
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
