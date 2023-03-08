# frozen_string_literal: true

module Verification
  module Patches
    module PermissionsService
      def denied_when_permitted_by_groups?(permission, user)
        permission.groups.each do |group|
          group.rules.each do |rule|
            return :not_verified if rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified' && !user.verified?
          end
        end

        super
      end
    end
  end
end
