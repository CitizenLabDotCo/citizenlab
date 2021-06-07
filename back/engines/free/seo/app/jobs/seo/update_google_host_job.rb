module Seo
  class UpdateGoogleHostJob < ApplicationJob
    def run
      return unless Rails.env.production? && AppConfiguration.instance.settings('core', 'lifecycle_stage') == 'active'

      host = AppConfiguration.instance.host
      url  = "https://#{host}"

      GoogleHandler.new.tap do |handler|
        handler.verify_domain(host) unless url.end_with? 'citizenlab.co'
        handler.submit_to_search_console(url)
        handler.submit_sitemap(url)
      end
    end
  end
end
