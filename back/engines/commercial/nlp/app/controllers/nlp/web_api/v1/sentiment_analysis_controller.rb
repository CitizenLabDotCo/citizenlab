module NLP
    module WebApi
      module V1
        class SentimentAnalysisController < ApplicationController
          skip_before_action :authenticate_user
          skip_after_action :verify_authorized

          def test
            # debug
            puts params.inspect

            service = NLP::SentimentAnalysisService.new

            idea = { 
                "id" => "12345",
                "body_multiloc" => {
                    "en" => "this is a simple text and I think you are awesome."
                }
            }

            # {"id":"75da7f0b-3c80-4a0f-b6ae-d2ceec2cc501","body_multiloc":{

            response = service.run_sentiment_analysis(
              [idea], "en"             
            )

            puts response
            render json: response

          end

          def by_idea
            service = NLP::SentimentAnalysisService.new

            idea = Idea.find params[:idea_id]
            locale = params[:nlp_locale]
            
            response = service.run_sentiment_analysis(
              [idea], locale
            )

            puts response
            render json: response

          end

          def by_comment
            service = NLP::SentimentAnalysisService.new

            comment = Comment.find params[:comment_id]
            locale = params[:nlp_locale]
            
            response = service.run_sentiment_analysis(
              [comment], locale
            )

            puts response
            render json: response

          end

        #   def index
        #     locale = current_user.locale

        #     # debug
        #     Rails.logger.debug params.inspect

        #     idea = Idea.find params[:idea_id]
        #     # authorize idea, :show?

        #     service = NLP::SentimentAnalysisService.new

        #     encoded_idea = {
        #         doc_id: idea.id,
        #         text: idea.body_multiloc[locale]
        #     }

        #     response = service.run_sentiment_analysis(
        #       [idea],              
        #     )
        #     render json: response
        #   end
        end
      end
    end
  end