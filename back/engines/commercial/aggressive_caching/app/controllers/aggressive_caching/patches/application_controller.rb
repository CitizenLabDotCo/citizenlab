module AggressiveCaching
  module Patches
    module ApplicationController
      extend ActiveSupport::Concern

      included do
        include ::ActionCaching
        # For some Reason, ActionController::Caching is not picking up the Rails
        # cache_store by itself. This initialization works, but could probaby be
        # improved
        self.cache_store = Rails.cache

        skip_after_action :verify_policy_scoped, if: :aggressive_caching_active?
        skip_after_action :verify_authorized, if: :aggressive_caching_active?
      end

      def aggressive_caching_active?
        AppConfiguration.instance.feature_activated?('aggressive_caching')
      end

      # Helpers for the subclasses to determinte for whom to cache
      def caching_and_visitor?
        aggressive_caching_active? && current_user.nil?
      end

      def caching_and_non_admin?
        aggressive_caching_active? && (current_user.nil? || current_user.normal_user?)
      end

      # Quite some API responses embed data about whether the current user
      # follows the returned resource. This lets us still cache those responses
      # for users that are not following anything
      def caching_and_not_following?
        aggressive_caching_active? &&
          (current_user.nil? || (current_user.normal_user? && current_user&.follows&.none?))
      end
    end
  end
end
