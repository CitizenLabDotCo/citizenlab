module NLP
    module WebApi
      module V1
        class SentimentAnalysisController < ApplicationController
          skip_before_action :authenticate_user

          def test
            # debug
            puts params.inspect

            service = NLP::SentimentAnalysisService.new

            idea = { 
                "doci_id":"12345",
                "text":"this is a simple text and I think you are awesome."
            }

            response = service.run_sentiment_analysis(
              [idea],              
            )
            render json: response

          end

          def index
            locale = current_user.locale

            # debug
            Rails.logger.debug params.inspect

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