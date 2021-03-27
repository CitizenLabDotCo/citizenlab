class InitiativesTopic < ApplicationRecord
  belongs_to :initiative
  belongs_to :topic

  validates :initiative, :topic, presence: true
  # We would do this:
  # validates :topic_id, uniqueness: {scope: :initiative_id}
  # but the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead
end
