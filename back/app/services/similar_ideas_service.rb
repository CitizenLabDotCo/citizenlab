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
end