module NLP
  class SimilarityService

    def similarity tenant_id, idea, locale: nil, idea_ids: nil, min_score: nil, max_ids: nil
      if !locale
        locale = idea.title_multiloc.keys.first
      end
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")
      options = {}
      options[:idea_ids] = idea_ids if idea_ids
      options[:min_score] = min_score if min_score
      options[:max_ids] = max_ids if max_ids
      res = @api.similarity tenant_id, idea.id, locale, options
      if res.present?
        return res.map do |h|
          {
            idea_id: h['id'],
            score: h['score'].to_f
          }
        end
      else
        return []
      end
    end


    private

  end
end