# frozen_string_literal: true

module Seo
  class UpdateGoogleHostJob < ApplicationJob
    def run
      return unless Rails.env.production? && AppConfiguration.instance.settings('core', 'lifecycle_stage') == 'active'

      host = AppConfiguration.instance.host
      url  = "https://#{host}"

      GoogleHandler.new.tap do |handler|
        handler.verify_domain(host) if %w[citizenlab.co govocal.com].none? { |gv_domain| url.end_with?(gv_domain) }
        handler.submit_to_search_console(url)
        handler.submit_sitemap(url)
      end
    end
  end
end
