class UpsertEmbeddingJob < ApplicationJob
  queue_as :default

  def run(idea)
    embeddings_similarity = idea.embeddings_similarities.find_or_initialize_by(context: 'title_body')
    text = idea.title_multiloc.values.compact.first + "\n" + Nokogiri::HTML(idea.body_multiloc.values.compact.first).text
    embedding = CohereMultilingualEmbeddings.new.embedding(text[...2048]) # 2048 is the character limit in the text
    embeddings_similarity.embedding = embedding
    embeddings_similarity.save!
  end
end