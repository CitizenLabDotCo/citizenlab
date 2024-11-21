class EmbeddingsSimilarity < ApplicationRecord
  belongs_to :idea
  # has_neighbors :embedding

  validates :idea, presence: true # Also require vector?
end