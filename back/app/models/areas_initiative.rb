# == Schema Information
#
# Table name: areas_initiatives
#
#  id            :uuid             not null, primary key
#  area_id       :uuid
#  initiative_id :uuid
#
# Indexes
#
#  index_areas_initiatives_on_area_id                    (area_id)
#  index_areas_initiatives_on_initiative_id              (initiative_id)
#  index_areas_initiatives_on_initiative_id_and_area_id  (initiative_id,area_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (area_id => areas.id)
#  fk_rails_...  (initiative_id => initiatives.id)
#
class AreasInitiative < ApplicationRecord
  belongs_to :initiative
  belongs_to :area

  validates :initiative, :area, presence: true
  # We would do this: validates :area_id, uniqueness: {scope: :initiativeid} but
  # the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead

end
