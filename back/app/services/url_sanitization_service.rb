# frozen_string_literal: true

class UrlSanitizationService
    URL_WHITELIST = [
      %r{https:\/\/.*\.typeform\.com\/to\/.*},
      %r{https:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js},
      %r{https:\/\/docs.google.com\/forms\/d\/e\/.*\/viewform\?embedded=true},
      %r{https:\/\/surveys.enalyzer.com\/?\?pid=.*},
      %r{https:\/\/www\.survey-xact\.dk\/LinkCollector\?key=.*},
      %r{https:\/\/.*\.qualtrics\.com\/jfe\/form\/.*},
      %r{https:\/\/www\.smartsurvey\.co\.uk\/.*},
      %r{https:\/\/.*\.(microsoft|office)\.com\/},
      %r{https:\/\/.*www\.eventbrite\.com\/static\/widgets\/*},
      %r{https:\/\/.*arcgis\.com},
      %r{https:\/\/public\.tableau\.com.*},
      %r{https:\/\/.*datastudio\.google\.com\/embed*},
      %r{https:\/\/app\.powerbi\.com\/},
      %r{https:\/\/.*static\.ctctcdn\.com\/js*},
      %r{https:\/\/.*instagram\.com},
      %r{https:\/\/.*platform\.twitter\.com},
      %r{https:\/\/name\.konveio\.com},
    ].freeze

    def url_whitelisted?(url)
      URL_WHITELIST.any? { |regex| regex.match? url }
    end
end
