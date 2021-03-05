module Seo
  class FacebookHandler
    attr_reader :access_token

    def initialize(app_id, app_secret)
      oauth = ::Koala::Facebook::OAuth.new(app_id, app_secret)
      @access_token = oauth.get_app_access_token
    end

    def scrape(url)
      return unless access_token

      ::HTTParty.post("https://graph.facebook.com?id=#{url}&scrape=true&access_token=#{access_token}")
    end
  end
end
