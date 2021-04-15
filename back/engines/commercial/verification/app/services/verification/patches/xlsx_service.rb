# frozen_string_literal: true

module Verification
  module Patches
    module XlsxService
      def user_private_attributes
        super << 'verified'
      end

      def users_xlsx_columns
        if AppConfiguration.instance.feature_activated?('verification')
          super << { header: 'verified', f: ->(u) { u.verified }, skip_sanitization: true }
        else
          super
        end
      end
    end
  end
end
