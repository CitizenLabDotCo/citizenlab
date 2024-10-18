module AggressiveCaching
  module Patches
    module ApplicationController
      extend ActiveSupport::Concern

      included do
        include ActionController::Caching # Needed to make actionpack-action_caching work with ActionController::API
        self.cache_store = Rails.cache
      end

      # Needed to make actionpack-action_caching work with ActionController::API. Fake implemenetation of what is normally provided by ActionController::Base
      def action_has_layout=(value)
        value
      end

      def aggressive_caching_enabled?
        AppConfiguration.instance.feature_activated?('aggressive_caching')
      end
    end
  end
end
