module IdeaFeed
  # This service returns a list of ideas that are semantically diverse compared to
  # each other as well as compared to previous IdeaExposures for the user
  class DiversityService
    # candidates: A scope of ideas from which we can pick. idea_exposures should not be part of the candidates
    # idea_exposures: A scope of IdeaExposure records which we should assume the user has seen
    # n: The number of ideas to return
    def generate_list(candidates, idea_exposures, n = 5)
      seen_ideas = Idea.where(id: idea_exposures.select(:idea_id))
      seen_centroid = calculate_centroid_sql(seen_ideas)
      candidates_centroid = calculate_centroid_sql(candidates)

      candidates = prefetch_embeddings(candidates)
      seen_ideas = prefetch_embeddings(seen_ideas)

      seen_ideas = seen_ideas.to_a
      candidates = candidates.to_a

      selected_ideas = []
      n.times do
        next_idea = if seen_ideas.empty?
          find_closest_idea(candidates, candidates_centroid)
        else
          find_most_distant_idea(candidates, seen_centroid)
        end
        break if next_idea.nil?

        selected_ideas << next_idea
        seen_ideas << next_idea
        candidates.delete(next_idea)

        next_idea_embedding = next_idea.embeddings_similarities.first&.embedding
        next if next_idea_embedding.nil?

        seen_centroid = update_centroid(seen_centroid, next_idea_embedding, seen_ideas.size - 1)
      end
      selected_ideas
    end

    private

    def calculate_centroid_sql(ideas)
      ideas
        .joins(:embeddings_similarities)
        .where(embeddings_similarities: { embedded_attributes: 'title' })
        .average(:'embeddings_similarities.embedding')
    end

    def prefetch_embeddings(ideas)
      ideas.includes(:embeddings_similarities).where(embeddings_similarities: { embedded_attributes: ['title', nil] })
    end

    def find_closest_idea(ideas, centroid)
      ideas.max_by do |idea|
        idea_embedding = idea.embeddings_similarities.first&.embedding
        next -Float::INFINITY if idea_embedding.nil? || centroid.nil?

        cosine_similarity(centroid, idea_embedding)
      end
    end

    def find_most_distant_idea(ideas, centroid)
      ideas.min_by do |idea|
        idea_embedding = idea.embeddings_similarities.first&.embedding
        next Float::INFINITY if idea_embedding.nil? || centroid.nil?

        cosine_similarity(centroid, idea_embedding)
      end
    end

    def order_by_distance_from(centroid, ideas, direction)
      ideas
        .joins(:embeddings_similarities)
        .where(embeddings_similarities: { embedded_attributes: 'title' })
        .order(Arel.sql("embeddings_similarities.embedding <=> '[#{centroid.join(',')}]' #{direction}"))
    end

    def update_centroid(centroid, new_vector, count)
      return new_vector if centroid.nil?

      centroid.each_with_index.map do |value, index|
        ((value * count) + new_vector[index]) / (count + 1)
      end
    end

    def cosine_similarity(vec1, vec2)
      max_length = [vec1.length, vec2.length].max
      v1 = Vector.elements(vec1 + ([0] * (max_length - vec1.length)))
      v2 = Vector.elements(vec2 + ([0] * (max_length - vec2.length)))

      dot_product = v1.inner_product(v2)
      magnitude_product = v1.magnitude * v2.magnitude
      return 0.0 if magnitude_product.zero?

      dot_product / magnitude_product
    end
  end
end
