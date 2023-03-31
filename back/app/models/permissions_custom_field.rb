# frozen_string_literal: true

# == Schema Information
#
# Table name: permissions_custom_fields
#
#  id              :uuid             not null, primary key
#  permission_id   :uuid             not null
#  custom_field_id :uuid             not null
#  required        :boolean          default(TRUE), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_permission_field                              (permission_id,custom_field_id) UNIQUE
#  index_permissions_custom_fields_on_custom_field_id  (custom_field_id)
#  index_permissions_custom_fields_on_permission_id    (permission_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#  fk_rails_...  (permission_id => permissions.id)
#
class PermissionsCustomField < ApplicationRecord
  belongs_to :permission
  belongs_to :custom_field

  validates :permission, :custom_field, presence: true
  validates :permission_id, uniqueness: { scope: :custom_field_id }
end
