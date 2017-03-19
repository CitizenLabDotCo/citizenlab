class IdeasTopic < ApplicationRecord
  belongs_to :idea
  belongs_to :topic

  validates :idea, :topic, presence: true
end
