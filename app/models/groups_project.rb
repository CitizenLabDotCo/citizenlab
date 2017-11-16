class GroupsProject < ApplicationRecord
  belongs_to :group
  belongs_to :project

  validates :group, :project, presence: true

  scope :order_new, -> (direction=:desc) {order(created_at: direction)}
end