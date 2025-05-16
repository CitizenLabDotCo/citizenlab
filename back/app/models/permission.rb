# frozen_string_literal: true

# == Schema Information
#
# Table name: permissions
#
#  id                                 :uuid             not null, primary key
#  action                             :string           not null
#  permitted_by                       :string           not null
#  permission_scope_id                :uuid
#  permission_scope_type              :string
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#  global_custom_fields               :boolean          default(FALSE), not null
#  verification_expiry                :integer
#  access_denied_explanation_multiloc :jsonb            not null
#
# Indexes
#
#  index_permissions_on_action               (action)
#  index_permissions_on_permission_scope_id  (permission_scope_id)
#
class Permission < ApplicationRecord
  PERMITTED_BIES = %w[everyone everyone_confirmed_email users admins_moderators verified].freeze
  ACTIONS = {
    # NOTE: Order of actions in each array is used when using :order_by_action
    nil => %w[visiting following attending_event],
    'information' => %w[attending_event],
    'ideation' => %w[posting_idea commenting_idea reacting_idea attending_event],
    'proposals' => %w[posting_idea commenting_idea reacting_idea attending_event],
    'native_survey' => %w[posting_idea attending_event],
    'community_monitor_survey' => %w[posting_idea],
    'survey' => %w[taking_survey attending_event],
    'poll' => %w[taking_poll attending_event],
    'voting' => %w[voting commenting_idea attending_event],
    'volunteering' => %w[volunteering attending_event],
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
  has_many :permissions_custom_fields, -> { order(:ordering).includes(:custom_field) }, inverse_of: :permission, dependent: :destroy
  has_many :custom_fields, -> { order(:ordering) }, through: :permissions_custom_fields

  validates :action, presence: true, inclusion: { in: ->(permission) { available_actions(permission.permission_scope) } }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: SCOPE_TYPES }
  validate :validate_verified_permitted_by
  validate :validate_verification_expiry

  before_validation :set_permitted_by_and_global_custom_fields, on: :create
  before_validation :sanitize_access_denied_explanation_multiloc

  def self.available_actions(permission_scope)
    return [] if permission_scope && !permission_scope.respond_to?(:participation_method)

    ACTIONS[permission_scope&.participation_method]
  end

  # Remove any actions that are not enabled on the project
  def self.enabled_actions(permission_scope)
    return available_actions(permission_scope) if permission_scope&.pmethod&.return_disabled_actions?

    available_actions(permission_scope).reject do |action|
      (action == 'posting_idea' && !permission_scope&.submission_enabled?) ||
        (action == 'reacting_idea' && !permission_scope&.reacting_enabled?) ||
        (action == 'commenting_idea' && !permission_scope&.commenting_enabled?)
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
    # Verification can be enabled by permitted_by OR by a verification group
    return true if permitted_by == 'verified'
    return true if groups.any? && Verification::VerificationService.new.find_verification_group(groups)

    false
  end

  def allow_global_custom_fields?
    return true if %w[users verified].include? permitted_by

    false
  end

  private

  def sanitize_access_denied_explanation_multiloc
    return unless access_denied_explanation_multiloc&.any?

    self.access_denied_explanation_multiloc = SanitizationService.new.sanitize_multiloc(
      access_denied_explanation_multiloc,
      []
    )
  end

  def set_permitted_by_and_global_custom_fields
    self.permitted_by ||= if action == 'following'
      'everyone_confirmed_email'
    else
      'users'
    end
    self.global_custom_fields ||= true
  end

  def validate_verified_permitted_by
    return unless permitted_by == 'verified' && Verification::VerificationService.new.first_method_enabled_for_verified_actions.nil?

    errors.add(
      :permitted_by,
      :verified_permitted_by_not_allowed,
      message: 'Verified permitted_by is not allowed because there are no methods enabled for actions.'
    )
  end

  def validate_verification_expiry
    return if verification_expiry.nil?
    return if permitted_by == 'verified' || !verification_expiry_changed?

    errors.add(
      :permitted_by,
      :verification_expiry_cannot_be_set,
      message: 'Verification expiry can only be set for a verified permitted_by.'
    )
  end
end
