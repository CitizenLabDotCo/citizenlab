class IdeasTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :topic

  validates :idea, :topic, presence: true
  validates :topic_id, uniqueness: {scope: :idea_id}
end
