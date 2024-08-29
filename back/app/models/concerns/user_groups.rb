# frozen_string_literal: true

module UserGroups
  extend ActiveSupport::Concern

  included do
    has_many :memberships, dependent: :destroy
    has_many :manual_groups, class_name: 'Group', source: 'group', through: :memberships

    scope :in_any_group, lambda { |groups|
      user_ids = groups.flat_map { |group| in_group(group).ids }.uniq
      where(id: user_ids)
    }

    scope :in_group, lambda { |group|
      return SmartGroups::RulesService.new.filter(all, group.rules) if group.rules?

      joins(:memberships).where(memberships: { group_id: group.id })
    }
  end

  def smart_groups
    rules_service.groups_for_user(self)
  end

  def groups
    manual_groups + smart_groups
  end

  def group_ids
    manual_group_ids + smart_groups.pluck(:id)
  end

  def in_any_groups?(groups_to_check)
    @groups ||= groups # Memoized here to avoid .groups not returning correctly when groups are added / removed
    @groups.intersection(groups_to_check).any?
  end

  def member_of?(group_id)
    memberships.any? { |m| m.group_id == group_id }
  end

  private

  def rules_service
    @rules_service ||= SmartGroups::RulesService.new
  end
end
