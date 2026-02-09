class SimilarIdeasService
  DEFAULT_EMBEDDED_ATTRIBUTES = %w[body title]

  attr_reader :idea

  def initialize(idea)
    @idea = idea
  end

  def similar_ideas(scope: nil, limit: nil, title_threshold: 0.0, body_threshold: 0.0, embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    ids = []
    embedded_attributes.each do |embedded_attribute|
      case embedded_attribute
      when 'body'
        if body_threshold && body_threshold > 0.0 && idea.body_multiloc.present?
          ids += similar_by_text_attribute(locale.resolve_multiloc(idea.body_multiloc), 'body', body_threshold, scope:).pluck(:embeddable_id)
        end
      when 'title'
        if title_threshold && title_threshold > 0.0 && idea.title_multiloc.present?
          ids += similar_by_text_attribute(locale.resolve_multiloc(idea.title_multiloc), 'title', title_threshold, scope:).pluck(:embeddable_id)
        end
      end
    end
    ids = ids.take(limit) if limit

    (scope || Idea).where(id: ids).order_as_specified(id: ids)
  end

  def upsert_embeddings!(embedded_attributes: DEFAULT_EMBEDDED_ATTRIBUTES)
    DEFAULT_EMBEDDED_ATTRIBUTES.each do |embedded_attribute|
      case embedded_attribute
      when 'title'
        upsert_embedding!(locale.resolve_multiloc(idea.title_multiloc), embedded_attribute)
      when 'body'
        upsert_embedding!(locale.resolve_multiloc(idea.body_multiloc), embedded_attribute)
      end
    end
  end

  def upsert_embedding!(text, embedded_attributes)
    embeddings_similarity = idea.embeddings_similarities.find_or_initialize_by(embedded_attributes:)
    embedding = CohereMultilingualEmbeddings.new.embedding(text)
    embeddings_similarity.embedding = embedding
    embeddings_similarity.save!
  end

  private

  def similar_by_text_attribute(text, embedded_attributes, distance_threshold, scope: nil)
    # Watch out when editing the code of this method! Make sure the HNSW index is used.
    # https://www.notion.so/govocal/Research-Duplicate-Detection-1a19663b7b268080b211fdbd88ca2cd2?pvs=4#1a19663b7b2680a7a8d4fee6988baf0a

    # embsim.nearest_neighbors(:embedding, distance: 'cosine') does not support
    # applying a threshold on the neighbor_distance.

    sql_embedding = "[#{embedding_for_text(text).join(',')}]"

    embsims = EmbeddingsSimilarity
      .where.not(embedding: nil)
      .order(
        ActiveRecord::Base.sanitize_sql_for_order([
          Arel.sql('embedding <=> ?::vector'),
          sql_embedding
        ])
      )

    if distance_threshold
      embsims = embsims.where(
        Arel.sql('embedding <=> ?::vector < ?'),
        sql_embedding,
        distance_threshold
      )
    end

    embsims = embsims.where(embeddable: scope) if scope

    embsims
      .where.not(embeddable_id: idea.id)
      .where(embedded_attributes:)
  end

  def embedding_for_text(text)
    CohereMultilingualEmbeddings.new.embedding(text)
  end

  def locale
    @locale ||= Locale.new(idea.author&.locale || AppConfiguration.instance.settings('core', 'locales').first)
  end
end
