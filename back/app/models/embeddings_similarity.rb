# == Schema Information
#
# Table name: embeddings_similarities
#
#  id         :uuid             not null, primary key
#  embedding  :vector(1024)     not null
#  idea_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_embeddings_similarities_on_idea_id  (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#
class EmbeddingsSimilarity < ApplicationRecord
  belongs_to :idea
  has_neighbors :embedding

  validates :idea, presence: true # Also require embedding?
end
