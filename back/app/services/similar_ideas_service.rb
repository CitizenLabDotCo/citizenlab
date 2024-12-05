class SimilarIdeasService
  DEFAULT_NUM_SIMILAR_IDEAS = 10
  DEFAULT_EMBEDDED_ATTRIBUTES = 'title_body'

  attr_reader :idea

  def initialize(idea)
    @idea = idea
  end

  def similar_ideas(scope: Idea, limit: DEFAULT_NUM_SIMILAR_IDEAS, embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    embedding = idea.embeddings_similarities.where(embedded_attributes:).first
    return scope.none if !embedding

    similarities = embedding
      .nearest_neighbors(:embedding, distance: 'cosine')
      .where(embeddable: scope)
      .where.not(embeddable_id: idea.id)
      .where(embedded_attributes:)
    similarities = similarities.limit(limit) if limit

    ids = similarities.map(&:embeddable_id)
    scope.where(id: ids).order_as_specified(id: ids)
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

  private def embeddings_text_title_body
    locale = Locale.new(idea.author&.locale || AppConfiguration.instance.settings('core', 'locales').first)
    text = locale.resolve_multiloc(idea.title_multiloc) + "\n\n" + Nokogiri::HTML(locale.resolve_multiloc(idea.body_multiloc)).text
    text[...2048] # 2048 is the character limit for the text with Cohere multilingual embeddings
  end
end