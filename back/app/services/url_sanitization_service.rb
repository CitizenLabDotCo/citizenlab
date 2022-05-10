# frozen_string_literal: true

class UrlSanitizationService
    URL_WHITELIST = [
      %r{\Ahttps:\/\/(.+\.)typeform\.com\/to\/},
      %r{\Ahttps:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js},
      %r{\Ahttps:\/\/docs.google.com\/forms\/d\/e\/.*\/viewform\?embedded=true},
      %r{\Ahttps:\/\/surveys.enalyzer.com\/?\?pid=.*},
      %r{\Ahttps:\/\/www\.survey-xact\.dk\/LinkCollector\?key=.*},
      %r{\Ahttps:\/\/(.+\.)qualtrics\.com\/jfe\/form\/},
      %r{\Ahttps:\/\/www\.smartsurvey\.co\.uk\/},
      %r{\Ahttps:\/\/(.+\.)(microsoft|office)\.com\/},
      %r{\Ahttps:\/\/www\.eventbrite\.com\/static\/widgets\/},
      %r{\Ahttps:\/\/.*arcgis\.com\/},
      %r{\Ahttps:\/\/public\.tableau\.com\/},
      %r{\Ahttps:\/\/.*datastudio\.google\.com\/embed\/},
      %r{\Ahttps:\/\/app\.powerbi\.com\/},
      %r{\Ahttps:\/\/.*static\.ctctcdn\.com\/js\/},
      %r{\Ahttps:\/\/.*instagram\.com\/},
      %r{\Ahttps:\/\/.*platform\.twitter\.com\/},
      %r{\Ahttps:\/\/name\.konveio\.com\/},
      %r{\Ahttps:\/\/facebook\.com\/},
    ].freeze

    def url_whitelisted?(url)
      URL_WHITELIST.any? { |regex| regex.match? url }
    end
end
