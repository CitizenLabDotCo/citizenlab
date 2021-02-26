module NLP
  module WebApi
    module V1
      class TagSuggestionsController < ApplicationController
        skip_after_action :verify_authorized, only: [:index]

        def index
          locale = current_user.locale

          @ideas = policy_scope(Idea)
          @ideas = @ideas.where(project_id: params[:projects]) if params[:projects].present?
          @ideas = @ideas.where(id: params[:idea_ids]) if params[:idea_ids].present?

          @tag_suggestions = TagSuggestionService.new.suggest(@ideas, locale).map { |e|
            {
              title_multiloc: {
                locale => e["text"]
              }
            }
          }

          render json: { data: @tag_suggestions }.to_json
        end
      end
    end
  end
end
