module NLP
  class SimilarityService

    def similarity tenant_id, idea, locale: nil, idea_ids: nil, min_score: nil, max_ideas: nil
      if !locale
        locale = idea.title_multiloc.keys.first
        tenant_locales = Tenant.find(tenant_id).settings.dig('core', 'locales')
        if !tenant_locales.include? locale
          locale = tenant_locales.first
        end
      end
      
      options = {}
      options[:idea_ids] = idea_ids if idea_ids
      options[:min_score] = min_score if min_score
      options[:max_ideas] = max_ideas if max_ideas
      res = NLP::Api.new.similarity tenant_id, idea.id, locale, options
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