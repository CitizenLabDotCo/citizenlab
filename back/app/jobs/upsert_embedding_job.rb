class UpsertEmbeddingJob < ApplicationJob
  queue_as :default

  def run(idea)
    SimilarIdeasService.new(idea).upsert_embeddings!
  end
end
