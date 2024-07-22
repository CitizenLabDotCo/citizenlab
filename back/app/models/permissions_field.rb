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
  # This attribute will be calculated but not persisted
  attribute :locked, :boolean, default: false

  acts_as_list column: :ordering, top_of_list: 0, scope: :permission

  belongs_to :permission
  belongs_to :custom_field, optional: true

  has_many :groups, through: :permission

  validates :permission, presence: true
  validates :custom_field, presence: true
  validates :permission_id, uniqueness: { scope: :custom_field_id }

  before_destroy :prevent_destroy

  def can_be_reordered?
    # Only allow if not locked/hidden by verification
    field_type == 'custom_field'
  end

  def title_multiloc
    custom_field&.title_multiloc || {}
  end
end
