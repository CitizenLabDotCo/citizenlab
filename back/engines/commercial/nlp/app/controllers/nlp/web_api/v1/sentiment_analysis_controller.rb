module NLP
    module WebApi
      module V1
        class SentimentAnalysisController < ApplicationController
          skip_before_action :authenticate_user

          def index
            locale = current_user.locale

            idea = Idea.find params[:idea_id]
            authorize idea, :show?

            service = NLP::SentimentAnalysisService.new

            # encoded_idea = {
            #     doc_id: idea.id,
            #     text: idea.body_multiloc[locale]
            # }

            response = service.run_sentiment_analysis(
              [idea],              
            )
            render json: response
          end
        end
      end
    end
  end