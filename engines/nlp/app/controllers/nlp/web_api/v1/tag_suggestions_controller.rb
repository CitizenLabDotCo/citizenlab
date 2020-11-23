module NLP
  module WebApi
    module V1
      class TagSuggestionsController < ApplicationController
        skip_after_action :verify_authorized, only: [:index]

        def index
          locale = current_user.locale
          @tag_suggestions = TagSuggestionService.new.suggest(policy_scope(Idea).where(id: params['idea_ids']), locale).map { |e|
            {
              title_multiloc: {
                locale => e["text"]
              }
            }
          }

          render json: @tag_suggestions, adapter: :json
        end
      end
    end
  end
end
