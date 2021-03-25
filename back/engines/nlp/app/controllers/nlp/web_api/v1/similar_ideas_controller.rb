module NLP
  module WebApi
    module V1
      class SimilarIdeasController < ApplicationController

        SIMILARITY_TRESHOLD = 0.15


        def index
          idea = Idea.find params[:idea_id]
          authorize idea, :show?

          service = NLP::SimilarityService.new
          similarities = service.similarity(
            Tenant.current.id, idea,
            idea_ids: policy_scope(Idea).ids, 
            min_score: SIMILARITY_TRESHOLD
            )
          @ideas = policy_scope(Idea.where(id: similarities.map{|h| h[:idea_id]}))
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))

          render json: linked_json(@ideas, ::WebApi::V1::SimilarIdeaSerializer, params: fastjson_params)
        end


        private

        def secure_controller?
          false
        end

      end
    end
  end
end
