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
  FIELD_TYPES = %w[custom_field email password name].freeze

  attribute :locked, :boolean, default: false

  belongs_to :permission
  belongs_to :custom_field, optional: true

  validates :permission, presence: true
  validates :custom_field, presence: true, if: -> { field_type == 'custom_field' }
  validates :permission_id, uniqueness: { scope: :custom_field_id }, if: -> { custom_field_id.present? }
  validates :field_type, presence: true, inclusion: { in: FIELD_TYPES } # TODO: JS Different if feature flag on
end
