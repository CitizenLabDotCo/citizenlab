module AggressiveCaching
  module Patches
    module ApplicationController
      extend ActiveSupport::Concern

      included do
        # Needed to make actionpack-action_caching work with ActionController::API
        include ActionController::Caching
        # For some Reason, ActionController::Caching is not picking up the Rails
        # cache_store by itself. This initialization works, but could probaby be
        # improved
        self.cache_store = Rails.cache

        skip_after_action :verify_policy_scoped, if: :aggressive_caching_active?
        skip_after_action :verify_authorized, if: :aggressive_caching_active?
      end

      # Needed to make actionpack-action_caching work with ActionController::API. Fake implemenetation of what is normally provided by ActionController::Base
      def action_has_layout=(value)
        value
      end

      # This method is typically overriden in the controller to determine for
      # which users aggressive caching should be active
      def aggressive_caching_active?
        AppConfiguration.instance.feature_activated?('aggressive_caching')
      end
    end
  end
end
