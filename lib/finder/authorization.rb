# frozen_string_literal: true

module Finder
  ## Finder::Helpers
  module Authorization
    def self.included(base)
      base.class_eval do
        attr_reader :current_user
      end
    end

    def _authorize_records
      @current_user = options[:authorize_with]

      result.performed_authorization = true
      filter_records { ::Pundit.policy_scope(current_user, records) }
    end
  end
end
