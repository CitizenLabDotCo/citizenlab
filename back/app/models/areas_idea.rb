class AreasIdea < ApplicationRecord
  belongs_to :idea
  belongs_to :area

  validates :idea, :area, presence: true
  # We would do this: validates :area_id, uniqueness: {scope: :idea_id} but
  # the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead

end
