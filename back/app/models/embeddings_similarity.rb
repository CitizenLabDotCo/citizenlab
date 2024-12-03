# == Schema Information
#
# Table name: embeddings_similarities
#
#  id              :uuid             not null, primary key
#  embedding       :vector(1024)     not null
#  embeddable_type :string           not null
#  embeddable_id   :uuid             not null
#  context         :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_embeddings_similarities_on_embeddable  (embeddable_type,embeddable_id)
#
class EmbeddingsSimilarity < ApplicationRecord
  belongs_to :idea
  has_neighbors :embedding

  validates :idea, presence: true # Also require embedding?
end
