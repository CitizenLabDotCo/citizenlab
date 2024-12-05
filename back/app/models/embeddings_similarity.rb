# == Schema Information
#
# Table name: embeddings_similarities
#
#  id                  :uuid             not null, primary key
#  embedding           :vector(1024)     not null
#  embeddable_type     :string           not null
#  embeddable_id       :uuid             not null
#  embedded_attributes :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_embeddings_similarities_on_embeddable           (embeddable_type,embeddable_id)
#  index_embeddings_similarities_on_embedded_attributes  (embedded_attributes)
#  index_embeddings_similarities_on_embedding            (embedding) USING hnsw
#
class EmbeddingsSimilarity < ApplicationRecord
  belongs_to :embeddable, polymorphic: true
  has_neighbors :embedding

  validates :embeddable, :embedding, presence: true
  validates :embedded_attributes, uniqueness: { scope: %i[embeddable_type embeddable_id] }
end
