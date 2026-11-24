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
        caching_and_not_previewing? && current_user.nil?
      end

      def caching_and_non_admin?
        caching_and_not_previewing? && (current_user.nil? || current_user.normal_user?)
      end

      # Quite some API responses embed data about whether the current user
      # follows the returned resource. This lets us still cache those responses
      # for users that are not following anything
      def caching_and_not_following?
        caching_and_not_previewing? &&
          (current_user.nil? || (current_user.normal_user? && current_user&.follows&.none?))
      end

      private

      # A cached copy is shared with everyone in its group, so it may only be stored from
      # a request that sees what the others see. A project preview link also shows its
      # draft project, so a request carrying one is never cached.
      def caching_and_not_previewing?
        aggressive_caching_active? && cookies[:preview_token].blank?
      end
    end
  end
end
