# frozen_string_literal: true

module Verification
  module Patches
    module AnonymizeUserService
      def anonymized_attributes(locales, user: nil, start_at: nil)
        super.merge('verified' => random_verified)
      end

      private

      def random_verified
        weighted_choice({ false => 3, true => 1 })
      end
    end
  end
end
