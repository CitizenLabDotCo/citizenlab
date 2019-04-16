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

          render json: @ideas, each_serializer: ::WebApi::V1::SimilarIdeaSerializer
        end


        private

        def secure_controller?
          false
        end

      end
    end
  end
end
