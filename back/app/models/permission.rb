# frozen_string_literal: true

# == Schema Information
#
# Table name: permissions
#
#  id                    :uuid             not null, primary key
#  action                :string           not null
#  permitted_by          :string           not null
#  permission_scope_id   :uuid
#  permission_scope_type :string
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_permissions_on_action               (action)
#  index_permissions_on_permission_scope_id  (permission_scope_id)
#
class Permission < ApplicationRecord
  PERMITTED_BIES = %w[everyone everyone_confirmed_email users groups admins_moderators].freeze
  ACTIONS = {
    nil => %w[posting_initiative voting_initiative commenting_initiative],
    'information' => [],
    'ideation' => %w[posting_idea voting_idea commenting_idea],
    'native_survey' => %w[posting_idea],
    'survey' => %w[taking_survey],
    'poll' => %w[taking_poll],
    'budgeting' => %w[commenting_idea budgeting],
    'volunteering' => []
  }
  SCOPE_TYPES = [nil, 'Project', 'Phase'].freeze

  belongs_to :permission_scope, polymorphic: true, optional: true
  has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions

  validates :action, presence: true, inclusion: { in: ->(permission) { available_actions(permission.permission_scope) } }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: SCOPE_TYPES }

  before_validation :set_permitted_by, on: :create

  scope :for_user, lambda { |user|
    next where(permitted_by: 'everyone') unless user
    next all if user.admin?

    permissions_for_everyone = where(permitted_by: %w[everyone users])

    moderating_context_ids = ParticipationContextService.new.moderating_participation_context_ids(user)
    moderating_permissions = where(permission_scope_id: moderating_context_ids)

    # The way we are getting group permissions here is a bit convoluted in order
    # to keep the relations structurally compatible for the final OR operation.
    user_groups = Group.joins(:permissions).where(permissions: self).with_user(user)
    group_permission_ids = GroupsPermission.where(permission: self).where(group: user_groups).select(:permission_id).distinct
    group_permissions = where(id: group_permission_ids)

    permissions_for_everyone.or(moderating_permissions).or(group_permissions)
  }

  def self.denied_reasons
    DENIED_REASONS
  end

  def self.available_actions(permission_scope)
    ACTIONS[permission_scope&.participation_method]
  end

  def granted_to?(user)
    !denied_reason user
  end

  def denied_reason(user)
    if permitted_by == 'everyone_confirmed_email'
      new_denied_reason user
    else
      old_denied_reason user
    end
  end

  def participation_conditions
    []
  end

  private

  # Access reasons via Permission.denied_reasons
  DENIED_REASONS = {
    not_permitted: 'not_permitted',
    missing_data: 'missing_data',
    not_signed_in: 'not_signed_in'
  }.freeze

  def denied_when_permitted_by_groups?(user)
    :not_permitted if user.nil? || !user.in_any_groups?(groups)
  end

  def set_permitted_by
    self.permitted_by ||= 'users'
  end

  def old_denied_reason(user)
    return if permitted_by == 'everyone'
    return if user&.admin?
    return if user && UserRoleService.new.can_moderate?(permission_scope, user)

    reason = case permitted_by
    when 'users' then :not_signed_in unless user # TODO
    when 'admins_moderators' then :not_permitted
    when 'groups' then denied_when_permitted_by_groups?(user)
    else
      raise "Unsupported permitted_by: '#{permitted_by}'."
    end

    Permission.denied_reasons[reason]
  end

  def new_denied_reason(user)
    return Permission.denied_reasons[:not_signed_in] if !user && permitted_by != 'everyone'

    user ||= User.new
    return if PermissionsService.new.requirements(self, user)[:permitted] # TODO: circular dependency (move this part of code into service?)

    Permission.denied_reasons[:missing_data]
  end
end

Permission.prepend_if_ee('SmartGroups::Patches::Permission')
Permission.prepend_if_ee('Verification::Patches::Permission')
