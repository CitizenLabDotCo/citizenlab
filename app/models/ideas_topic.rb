class IdeasTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :topic

  validates :idea, :topic, presence: true
  # We would do this:
  # validates :topic_id, uniqueness: {scope: :idea_id}
  # but the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead
end
