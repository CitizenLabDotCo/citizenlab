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
#  verification_expiry                :integer
#  access_denied_explanation_multiloc :jsonb            not null
#  everyone_tracking_enabled          :boolean          default(FALSE), not null
#  user_fields_in_form                :boolean          default(FALSE), not null
#  user_data_collection               :string           default("all_data"), not null
#  require_confirmed_email            :boolean          default(TRUE), not null
#  confirmed_email_expiry             :integer
#  require_name                       :boolean          default(TRUE), not null
#  require_password                   :boolean          default(TRUE), not null
#  require_verification               :boolean          default(FALSE), not null
#  require_confirmed_phone_number     :boolean          default(FALSE), not null
#  confirmed_phone_number_expiry      :integer
#  custom_fields_behavior             :string           default("global"), not null
#
# Indexes
#
#  index_permissions_on_action               (action)
#  index_permissions_on_permission_scope_id  (permission_scope_id)
#
class Permission < ApplicationRecord
  PERMITTED_BIES = %w[everyone users admins_moderators].freeze
  CUSTOM_FIELDS_BEHAVIORS = %w[global disabled custom].freeze
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
    'document_annotation' => %w[annotating_document attending_event],
    'common_ground' => %w[posting_idea reacting_idea attending_event]
  }
  SCOPE_TYPES = [nil, 'Phase'].freeze
  # 'everyone' is only meaningful for the submission action of participation
  # methods that support it (see ParticipationMethod::Base#supports_permitted_by_everyone?).
  EVERYONE_PERMITTED_ACTIONS = %w[posting_idea taking_survey].freeze
  UNSUPPORTED_DESCRIPTOR = {
    value: nil,
    locked: true,
    explanation: 'user_fields_in_form_not_supported_for_action'
  }

  # Set on the unsaved copies of the global 'visiting' permission that stand in
  # for the inheritable actions which have not been overridden.
  # See Permissions::PermissionInheritanceService.
  attr_writer :inherited

  scope :filter_enabled_actions, ->(permission_scope) { where(action: enabled_actions(permission_scope)) }
  scope :order_by_action, lambda { |permission_scope|
    order(Arel.sql(order_by_action_sql(permission_scope)))
  }

  belongs_to :permission_scope, polymorphic: true, optional: true
  has_many :groups_permissions, dependent: :destroy
  has_many :groups, through: :groups_permissions
  has_many :permissions_custom_fields, -> { order(:ordering).includes(:custom_field) }, inverse_of: :permission, dependent: :destroy
  has_many :custom_fields, -> { order(:ordering) }, through: :permissions_custom_fields

  before_validation :sanitize_access_denied_explanation_multiloc, if: :access_denied_explanation_multiloc
  validates :action, presence: true, inclusion: { in: ->(permission) { available_actions(permission.permission_scope) } }
  validates :permitted_by, presence: true, inclusion: { in: PERMITTED_BIES }
  validates :action, uniqueness: { scope: %i[permission_scope_id permission_scope_type] }
  validates :permission_scope_type, inclusion: { in: SCOPE_TYPES }
  validate :validate_permitted_by_everyone
  validates :user_data_collection, inclusion: { in: %w[all_data demographics_only anonymous] }
  validates :custom_fields_behavior, inclusion: { in: CUSTOM_FIELDS_BEHAVIORS }, allow_nil: true

  before_validation :apply_creation_defaults, on: :create

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

  def inherited?
    @inherited == true
  end

  def verification_enabled?
    # Verification can be enabled by the require_verification attribute OR by a verification group
    return true if require_verification
    return true if groups.any? && Verification::VerificationService.new.find_verification_group(groups)

    false
  end

  # Admins and managers are never asked demographic questions. Masked rather than
  # stored, so the choice comes back if the action is opened up again.
  def custom_fields_behavior
    return 'disabled' if permitted_by == 'admins_moderators'

    super
  end

  def everyone_tracking_enabled?
    permitted_by == 'everyone' && everyone_tracking_enabled
  end

  # Attribute used in frontend to render access rights UI
  def user_fields_in_form_descriptor
    return UNSUPPORTED_DESCRIPTOR unless permission_scope.is_a?(Phase)

    UserFieldsInFormService.user_fields_in_form_descriptor(
      self,
      permission_scope.participation_method
    )
  end

  # This just checks if the user fields are enabled for the form
  # This does not guarantee that they will be added, because it is possible
  # that there are none
  def user_fields_in_form_enabled?
    !!user_fields_in_form_descriptor[:value]
  end

  def permitted_by_everyone_allowed?
    return false unless EVERYONE_PERMITTED_ACTIONS.include?(action)
    return false unless permission_scope.respond_to?(:pmethod)

    permission_scope.pmethod.supports_permitted_by_everyone?
  end

  # Also applied to the unsaved permissions built by
  # Permissions::PermissionInheritanceService, which never reach a validation.
  def apply_creation_defaults
    if permitted_by.nil?
      self.permitted_by = 'users'
      # Following used to default to the 'everyone_confirmed_email' permitted_by.
      # That value no longer exists, so we reproduce the same effect with the
      # require_* attributes: only a confirmed email is required.
      if action == 'following'
        self.require_confirmed_email = true
        self.require_name = false
        self.require_password = false
      end
    end
    self.custom_fields_behavior ||= 'global'
  end

  private

  # Rendered with `dangerouslySetInnerHTML` (`useCustomAccessDeniedMessage.tsx`,
  # `AccessDenied/index.tsx`). The editor is a plain input, so the allowlist is narrow.
  def sanitize_access_denied_explanation_multiloc
    self.access_denied_explanation_multiloc = SanitizationService.new.sanitize_body_multiloc(
      access_denied_explanation_multiloc,
      %i[decoration link]
    )
  end

  def validate_permitted_by_everyone
    return unless permitted_by == 'everyone'
    return if permitted_by_everyone_allowed?

    errors.add(
      :permitted_by,
      :everyone_not_allowed_for_action,
      message: "permitted_by can only be 'everyone' when the action and participation method allow it."
    )
  end
end
