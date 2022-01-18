# == Schema Information
#
# Table name: areas_ideas
#
#  id      :uuid             not null, primary key
#  area_id :uuid
#  idea_id :uuid
#
# Indexes
#
#  index_areas_ideas_on_area_id              (area_id)
#  index_areas_ideas_on_idea_id              (idea_id)
#  index_areas_ideas_on_idea_id_and_area_id  (idea_id,area_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (area_id => areas.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class AreasIdea < ApplicationRecord
  belongs_to :idea
  belongs_to :area

  validates :idea, :area, presence: true
  # We would do this: validates :area_id, uniqueness: {scope: :idea_id} but
  # the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead

end
