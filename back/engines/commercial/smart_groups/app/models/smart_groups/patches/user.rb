# frozen_string_literal: true

module SmartGroups
  module Patches
    module User
      def self.prepended(base)
        base.class_eval do
          scope :in_group, lambda { |group|
            return SmartGroups::RulesService.new.filter(all, group.rules) if group.rules?

            ::User::IN_GROUP_PROC.call(group)
          }
        end
      end

      def smart_groups
        rules_service.groups_for_user(self)
      end

      def groups
        super + smart_groups
      end

      def group_ids
        super + smart_groups.pluck(:id)
      end

      def in_any_groups?(groups)
        super || rules_service.groups_for_user(self, groups.rules).exists?
      end

      private

      def rules_service
        @rules_service ||= SmartGroups::RulesService.new
      end
    end
  end
end
