module NLP
  class SimilarityService

    def similarity tenant_id, idea, locale: nil, filter_idea_ids: nil, min_score: nil
      if !locale
        locale = idea.title_multiloc.keys.first
      end
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")
      options = {}
      options[:filter_idea_ids] = filter_idea_ids if filter_idea_ids
      options[:min_score] = min_score if min_score
      res = @api.ideas_duplicates tenant_id, idea.id, locale, options
      if res.present?
        return res.map do |h|
          {
            idea: Idea.find(h['id']),
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