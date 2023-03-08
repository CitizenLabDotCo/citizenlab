# frozen_string_literal: true

module Verification
  module Patches
    module PermissionsService
      def denied_when_permitted_by_groups?(permission, user)
        denied_reason = super

        if denied_reason == :not_permitted && !user.verified?
          permission.groups.each do |group|
            group.rules.each do |rule|
              return :not_verified if rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified'
            end
          end
        end
        denied_reason
      end
    end
  end
end
