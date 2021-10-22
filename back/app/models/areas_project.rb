# == Schema Information
#
# Table name: areas_projects
#
#  id         :uuid             not null, primary key
#  area_id    :uuid
#  project_id :uuid
#
# Indexes
#
#  index_areas_projects_on_area_id     (area_id)
#  index_areas_projects_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (area_id => areas.id)
#  fk_rails_...  (project_id => projects.id)
#
class AreasProject < ApplicationRecord
  belongs_to :project
  belongs_to :area

  validates :project, :area, presence: true
end
