# frozen_string_literal: true

module Verification
  module Patches
    module Permission
      def self.prepended(base)
        base.singleton_class.prepend(ClassMethods)
      end

      module ClassMethods
        def denied_reasons
          super.merge(not_verified: 'not_verified')
        end
      end

      def denied_when_permitted_by_groups?(user)
        if requires_verification? && !user&.verified?
          :not_verified
        else
          super
        end
      end

      def requires_verification?
        return unless permitted_by == 'groups'

        VerificationService.new.find_verification_group(groups)
      end
    end
  end
end
