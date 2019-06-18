class AreasInitiative < ApplicationRecord
  belongs_to :initiative
  belongs_to :area

  validates :initiative, :area, presence: true
  # We would do this: validates :area_id, uniqueness: {scope: :initiativeid} but
  # the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead

end
