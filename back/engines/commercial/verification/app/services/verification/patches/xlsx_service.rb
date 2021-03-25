# frozen_string_literal: true

module Verification
  module Patches
    module XlsxService
      def user_private_attributes
        super << 'verified'
      end

      def users_xlsx_columns
        super << { header: 'verified', f: ->(u) { u.verified }, skip_sanitization: true }
      end
    end
  end
end
