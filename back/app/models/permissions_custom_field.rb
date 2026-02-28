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
#  ordering        :integer          default(0)
#  deleted_at      :datetime
#
# Indexes
#
#  index_permission_field                              (permission_id,custom_field_id) UNIQUE WHERE (deleted_at IS NULL)
#  index_permissions_custom_fields_on_custom_field_id  (custom_field_id)
#  index_permissions_custom_fields_on_deleted_at       (deleted_at)
#  index_permissions_custom_fields_on_permission_id    (permission_id)
#
# Foreign Keys
#
#  fk_rails_...  (custom_field_id => custom_fields.id)
#  fk_rails_...  (permission_id => permissions.id)
#
class PermissionsCustomField < ApplicationRecord
  acts_as_paranoid
  # This attribute will be calculated but not persisted - will be 'verification' or 'groups'
  attribute :lock, :string

  acts_as_list column: :ordering, top_of_list: 0, scope: :permission

  belongs_to :permission
  belongs_to :custom_field

  has_many :groups, through: :permission

  validates :permission, :custom_field, presence: true
  validates :permission_id, uniqueness: { scope: :custom_field_id, conditions: -> { where(deleted_at: nil) } }

  def title_multiloc
    custom_field.title_multiloc || {}
  end
end
