# frozen_string_literal: true

# == Schema Information
#
# Table name: groups_projects
#
#  id         :uuid             not null, primary key
#  group_id   :uuid
#  project_id :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_groups_projects_on_group_id                 (group_id)
#  index_groups_projects_on_group_id_and_project_id  (group_id,project_id) UNIQUE
#  index_groups_projects_on_project_id               (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (group_id => groups.id)
#  fk_rails_...  (project_id => projects.id)
#
class GroupsProject < ApplicationRecord
  belongs_to :group
  belongs_to :project

  validates :group, :project, presence: true

  scope :order_new, ->(direction = :desc) { order(created_at: direction) }
end
