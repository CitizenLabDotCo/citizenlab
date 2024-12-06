class SimilarIdeasService
  DEFAULT_NUM_SIMILAR_IDEAS = 10
  DEFAULT_EMBEDDED_ATTRIBUTES = 'title_body'

  attr_reader :idea

  def initialize(idea)
    @idea = idea
  end

  def similar_ideas(scope: nil, limit: DEFAULT_NUM_SIMILAR_IDEAS, embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    embedding = idea.embeddings_similarities.where(embedded_attributes:).first
    return (scope || Idea).none if !embedding

    similarities = EmbeddingsSimilarity
        .where.not(embedding: nil)
        .select("\"embeddings_similarities\".\"embedding\" <=> '#{embedding.embedding}' AS neighbor_distance", :embeddable_id)
        .order('neighbor_distance')
    # similarities = embedding.nearest_neighbors(:embedding, distance: 'cosine')



    # value = ::Pgvector.encode(value) unless value.is_a?(String)
    # quoted_column = quote_identifier(column)
    # distance = distance.to_s

    # operator =
    #   case distance
    #   when "inner_product"
    #     "<#>"
    #   when "cosine"
    #     "<=>"
    #   when "euclidean"
    #     "<->"
    #   when "taxicab"
    #     "<+>"
    #   when "hamming"
    #     "<~>"
    #   when "jaccard"
    #     "<%>"
    #   end

    # raise ArgumentError, "Invalid distance: #{distance}" unless operator

    # order = "#{quoted_column} #{operator} ?"

    # neighbor_distance =
    #   if distance == "inner_product"
    #     "(#{order}) * -1"
    #   else
    #     order
    #   end

    # select_append(Sequel.lit("#{neighbor_distance} AS neighbor_distance", value))
    #   .exclude(column => nil)
    #   .order(Sequel.lit(order, value))




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
