class GroupsProject < ApplicationRecord
  belongs_to :group
  belongs_to :project

  validates :group, :project, presence: true
end