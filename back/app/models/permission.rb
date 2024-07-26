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
#  global_custom_fields  :boolean          default(FALSE), not null
#
# Indexes
#
#  index_permissions_on_action               (action)
#  index_permissions_on_permission_scope_id  (permission_scope_id)
#
class Permission < ApplicationRecord
  PERMITTED_BIES = %w[everyone everyone_confirmed_email users groups admins_moderators verified].freeze
  ACTIONS = {
    # NOTE: Order of actions in each array is used when using :order_by_action
    nil => %w[visiting following posting_initiative commenting_initiative reacting_initiative],
    'information' => %w[attending_event],
    'ideation' => %w[posting_idea commenting_idea reacting_idea attending_event],
    'proposals' => %w[posting_idea commenting_idea reacting_idea attending_event],
    'native_survey' => %w[posting_idea attending_event],
    'survey' => %w[taking_survey attending_event],
    'poll' => %w[taking_poll attending_event],
    'voting' => %w[voting commenting_idea attending_event],
    'volunteering' => %w[attending_event],
    'document_annotation' => %w[annotating_document attending_event]
  }
  SCOPE_TYPES = [nil, 'Phase'].freeze

  scope :filter_enabled_actions, ->(permission_scope) { where(action: enabled_actions(permission_scope)) }
  scope :order_by_action, lambda { |permission_scope|
    order(Arel.sql(order_by_action_sql(permission_scope)))
  }

  belongs_to :permission_scope, polymorphic: true, optional: true
  has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions
  has_many :permissions_fields, -> { order(:ordering).includes(:custom_field) }, inverse_of: :permission, dependent: :destroy
  has_many :custom_fields, -> { order(:ordering) }, through: :permissions_fields

  validates :action, presence: true, inclusion: { in: ->(permission) { available_actions(permission.permission_scope) } }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: SCOPE_TYPES }

  before_validation :set_permitted_by_and_global_custom_fields, on: :create
  before_validation :update_global_custom_fields, on: :update

  def self.available_actions(permission_scope)
    return [] if permission_scope && !permission_scope.respond_to?(:participation_method)

    ACTIONS[permission_scope&.participation_method]
  end

  # Remove any actions that are not enabled on the project
  def self.enabled_actions(permission_scope)
    return available_actions(permission_scope) if permission_scope&.pmethod&.return_disabled_actions?

    available_actions(permission_scope).filter_map do |action|
      next if
        (action == 'posting_idea' && !permission_scope&.posting_enabled?) ||
        (action == 'reacting_idea' && !permission_scope&.reacting_enabled?) ||
        (action == 'commenting_idea' && !permission_scope&.commenting_enabled?)

      action
    end
  end

  def self.order_by_action_sql(permission_scope)
    sql = 'CASE action '
    actions = enabled_actions(permission_scope)
    actions.each_with_index { |action, order| sql += "WHEN '#{action}' THEN #{order} " }
    sql += "ELSE #{actions.size} END"
    sql
  end

  def verification_enabled?
    false
  end

  def allow_global_custom_fields?
    return true if %w[users verified groups].include? permitted_by

    false
  end

  # TODO: Remove when verified actions are out of beta
  def permitted_by
    return 'users' if self[:permitted_by] == 'groups' && verified_actions_enabled?

    super
  end

  private

  def set_permitted_by_and_global_custom_fields
    self.permitted_by ||= if action == 'following'
      'everyone_confirmed_email'
    else
      'users'
    end
    self.global_custom_fields ||= allow_global_custom_fields?
  end

  # TODO: Method not needed once verified actions are out of beta
  def update_global_custom_fields
    return if verified_actions_enabled?

    self.global_custom_fields = false if (permitted_by == 'users')
  end

  def verified_actions_enabled?
    @verified_actions_enabled = AppConfiguration.instance.feature_activated?('verified_actions')
  end
end

Permission.include(Verification::Patches::Permission)
