# frozen_string_literal: true

# == Schema Information
#
# Table name: permissions_fields
#
#  id              :uuid             not null, primary key
#  permission_id   :uuid             not null
#  custom_field_id :uuid
#  required        :boolean          default(TRUE), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  field_type      :string           default("custom_field")
#  enabled         :boolean          default(TRUE), not null
#  config          :jsonb            not null
#  ordering        :integer          default(0)
#
# Indexes
#
#  index_permission_field                       (permission_id,custom_field_id) UNIQUE
#  index_permissions_fields_on_custom_field_id  (custom_field_id)
#  index_permissions_fields_on_permission_id    (permission_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#  fk_rails_...  (permission_id => permissions.id)
#
class PermissionsField < ApplicationRecord
  FIELD_TYPES = %w[custom_field email name].freeze

  # This attribute will be calculated but not persisted
  attribute :locked, :boolean, default: false

  acts_as_list column: :ordering, top_of_list: 0, scope: :permission

  belongs_to :permission
  belongs_to :custom_field, optional: true

  validates :permission, presence: true
  validates :custom_field, presence: true, if: -> { field_type == 'custom_field' }
  validates :permission_id, uniqueness: { scope: :custom_field_id }, if: -> { custom_field_id.present? }
  validates :permission_id, uniqueness: { scope: :field_type }, if: -> { field_type != 'custom_field' }
  validates :field_type, presence: true, inclusion: { in: FIELD_TYPES }
  validate :validate_config_keys
  validate :prevent_non_custom_permitted_by

  before_destroy :prevent_destroy

  def can_be_reordered?
    field_type == 'custom_field'
  end

  def title_multiloc
    custom_field&.title_multiloc || {}
  end

  private

  # Validate that which keys are allowed in the config field
  def validate_config_keys
    if field_type == 'email'
      allowed_keys = %w[password confirmed]
      if config.keys.any? { |key| allowed_keys.exclude?(key) }
        errors.add(:config, 'can only contain password and confirmed keys if field_type is email')
      end
    elsif config != {}
      errors.add(:config, 'can only be present if field_type is email')
    end
  end

  # Only allow fields with a 'custom' permitted_by to be saved
  def prevent_non_custom_permitted_by
    return unless Permissions::PermissionsFieldsService.new.custom_permitted_by_enabled?
    return if permission&.permitted_by == 'custom'

    errors.add(:permission, 'only fields with a permitted_by of "custom" can be saved')
    throw :abort
  end

  # Only custom_fields can be destroyed - other fields should be enabled/disabled
  def prevent_destroy
    return if field_type == 'custom_field'

    errors.add(:destroy, 'only field_type: "custom_field" can be destroyed')
    throw :abort
  end
end
