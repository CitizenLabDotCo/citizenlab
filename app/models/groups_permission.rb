class GroupsPermission < ApplicationRecord
	belongs_to :group
  belongs_to :permission

  validates :group, :permission, presence: true
end
