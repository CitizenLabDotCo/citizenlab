# frozen_string_literal: true

module Seo
  class ScrapeFacebookJob < ApplicationJob
    def run(url)
      return unless Rails.env.production?

      facebook_config = Verification::VerificationService.new.method_by_name('facebook')&.config || {}
      app_id     = facebook_config[:app_id]
      app_secret = facebook_config[:app_secret]
      return unless app_id && app_secret

      FacebookHandler.new(app_id, app_secret).tap do |handler|
        handler.scrape(url)
      end
    end
  end
end
