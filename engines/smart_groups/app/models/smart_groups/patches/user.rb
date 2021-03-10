module SmartGroups
  module Patches
    module User
      def self.prepended(base)
        base.class_eval do
          scope :in_group, lambda { |group|
            return SmartGroups::RulesService.new.filter(all, group.rules) if group.rules?

            joins(:memberships).where(memberships: { group_id: group.id })
          }
        end
      end

      def groups
        super + SmartGroups::RulesService.new.groups_for_user(self)
      end

      def group_ids
        super + SmartGroups::RulesService.new.groups_for_user(self).pluck(:id)
      end
    end
  end
end
