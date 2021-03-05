module Seo
  class ScrapeFacebookJob < ApplicationJob
    def run(url)
      return unless Rails.env.production?

      app_id     = AppConfiguration.instance.settings.dig('facebook_login', 'app_id')
      app_secret = AppConfiguration.instance.settings.dig('facebook_login', 'app_secret')
      FacebookHandler.new(app_id, app_secret).tap do |handler|
        handler.scrape(url)
      end
    end
  end
end
