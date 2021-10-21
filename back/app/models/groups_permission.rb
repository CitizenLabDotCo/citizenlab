# == Schema Information
#
# Table name: groups_permissions
#
#  id            :uuid             not null, primary key
#  permission_id :uuid             not null
#  group_id      :uuid             not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_groups_permissions_on_group_id       (group_id)
#  index_groups_permissions_on_permission_id  (permission_id)
#
# Foreign Keys
#
#  fk_rails_...  (group_id => groups.id)
#  fk_rails_...  (permission_id => permissions.id)
#
class GroupsPermission < ApplicationRecord
	belongs_to :group
  belongs_to :permission

  validates :group, :permission, presence: true
end
