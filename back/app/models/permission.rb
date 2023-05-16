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
  PERMITTED_BIES = %w[everyone everyone_confirmed_email users groups admins_moderators].freeze
  ACTIONS = {
    # NOTE: Order of actions in each array is used when using :order_by_action
    nil => %w[visiting posting_initiative commenting_initiative voting_initiative],
    'information' => [],
    'ideation' => %w[posting_idea commenting_idea voting_idea],
    'native_survey' => %w[posting_idea],
    'survey' => %w[taking_survey],
    'poll' => %w[taking_poll],
    'budgeting' => %w[commenting_idea budgeting],
    'volunteering' => [],
    'document_annotation' => [] # Maybe needs action(s) specified?
  }
  SCOPE_TYPES = [nil, 'Project', 'Phase'].freeze

  scope :filter_enabled_actions, ->(permission_scope) { where(action: enabled_actions(permission_scope)) }
  scope :order_by_action, lambda { |permission_scope|
    order(Arel.sql(order_by_action_sql(permission_scope)))
  }

  belongs_to :permission_scope, polymorphic: true, optional: true
  has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions
  has_many :permissions_custom_fields, -> { includes(:custom_field).order('custom_fields.ordering') }, inverse_of: :permission, dependent: :destroy
  has_many :custom_fields, -> { order(:ordering) }, through: :permissions_custom_fields

  validates :action, presence: true, inclusion: { in: ->(permission) { available_actions(permission.permission_scope) } }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: SCOPE_TYPES }

  before_validation :set_permitted_by_and_global_custom_fields, on: :create
  before_validation :update_global_custom_fields, on: :update

  def self.available_actions(permission_scope)
    ACTIONS[permission_scope&.participation_method]
  end

  def self.enabled_actions(permission_scope)
    # Remove any actions that are not enabled on the project
    available_actions(permission_scope).filter_map do |action|
      next if
        (action == 'posting_idea' && !permission_scope&.posting_enabled?) ||
        (action == 'voting_idea' && !permission_scope&.voting_enabled?) ||
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

  def participation_conditions
    []
  end

  private

  def set_permitted_by_and_global_custom_fields
    self.permitted_by ||= 'users'
    self.global_custom_fields ||= (permitted_by == 'users')
  end

  def update_global_custom_fields
    self.global_custom_fields = false if permitted_by == 'everyone_confirmed_email'
  end
end

Permission.prepend(SmartGroups::Patches::Permission)
