class SimilarIdeasService
  DEFAULT_NUM_SIMILAR_IDEAS = 10
  DEFAULT_EMBEDDED_ATTRIBUTES = 'title_body'

  attr_reader :idea

  def initialize(idea)
    @idea = idea
  end

  def similar_ideas(scope: nil, limit: DEFAULT_NUM_SIMILAR_IDEAS, embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES, distance_threshold: nil)
    embedding = idea.embeddings_similarities.where(embedded_attributes:).first
    return (scope || Idea).none if !embedding

    # embedding.nearest_neighbors(:embedding, distance: 'cosine') does not support
    # applying a threshold on the neighbor_distance.
    pgvec = "[#{embedding.embedding.join(',')}]"
    # neighbor_distance = Arel.sql("\"embedding\" <=> '#{embedding.embedding}'") # Couldn't find a safe way to substitute the embedding value, but embeddings are never created from user input.
    similarities = EmbeddingsSimilarity
      .where.not(embedding: nil)
      .order(ActiveRecord::Base::sanitize_sql_for_order(Arel.sql("\"embedding\" <=> '#{pgvec}'")))
    similarities = similarities.where('"embedding" <=> :embval < :thresh', embval: pgvec, thresh: distance_threshold) if distance_threshold

    similarities = similarities
      .where.not(embeddable_id: idea.id)
      .where(embedded_attributes:)
    similarities = similarities.where(embeddable: scope) if scope
    similarities = similarities.limit(limit) if limit

    ids = similarities.map(&:embeddable_id)
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

  def embeddings_text_title_body
    locale = Locale.new(idea.author&.locale || AppConfiguration.instance.settings('core', 'locales').first)
    title_text = locale.resolve_multiloc(idea.title_multiloc)
    body_text = Nokogiri::HTML(locale.resolve_multiloc(idea.body_multiloc)).text
    text = "#{title_text}\n\n#{body_text}"
    text[...2048] # 2048 is the character limit for the text with Cohere multilingual embeddings
  end
end
