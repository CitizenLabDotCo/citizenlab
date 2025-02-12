class AuthoringAssistanceService
  DEFAULT_NUM_SIMILAR_IDEAS = 10
  DEFAULT_EMBEDDED_ATTRIBUTES = 'title_body'

  attr_reader :authoring_assistance_response

  def initialize(authoring_assistance_response)
    @authoring_assistance_response = authoring_assistance_response
  end

  def analyze!
    prompt_response = {
      **duplicate_inputs_response,
      **toxicity_response,
      **custom_free_prompt_response
    }
    authoring_assistance_response.update!(prompt_response: prompt_response)
  end

  def similar_ideas(scope: nil, limit: DEFAULT_NUM_SIMILAR_IDEAS, embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES, distance_threshold: nil)
    embedding = idea.embeddings_similarities.where(embedded_attributes:).first
    return (scope || Idea).none if !embedding

    # embedding.nearest_neighbors(:embedding, distance: 'cosine') does not support
    # applying a threshold on the neighbor_distance.
    embeddings_pgvector = "[#{embedding.embedding.join(',')}]"
    similarities = EmbeddingsSimilarity
      .where.not(embedding: nil)
      .order(ActiveRecord::Base.sanitize_sql_for_order(Arel.sql("\"embedding\" <=> '#{embeddings_pgvector}'")))
    similarities = similarities.where('"embedding" <=> :embeddings_pgvector < :distance_threshold', embeddings_pgvector:, distance_threshold:) if distance_threshold

    similarities = similarities
      .where.not(embeddable_id: idea.id)
      .where(embedded_attributes:)
    similarities = similarities.where(embeddable: scope) if scope
    similarities = similarities.limit(limit) if limit

    ids = similarities.pluck(:embeddable_id)
    (scope || Idea).where(id: ids).order_as_specified(id: ids)
  end

  def upsert_embedding!(embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    embeddings_similarity = idea.embeddings_similarities.find_or_initialize_by(embedded_attributes:)
    embedding = CohereMultilingualEmbeddings.new.embedding(embeddings_text(embedded_attributes:))
    embeddings_similarity.embedding = embedding
    embeddings_similarity.save!
  end

  def embeddings_text(embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    embeddings_text_title_body
  end

  private

  def duplicate_inputs_response
    {
      duplicate_inputs: []
    }
  end

  def toxicity_response
    FlagInappropriateContent::ToxicityDetectionService.new.check_toxicity(authoring_assistance_response.idea) || {}
  end

  def custom_free_prompt_response
    {
      custom_free_prompt_response: nil
    }
  end
end
