module Frontend
  module WebApi
    module V1
      class ProductFeedbackController < FrontendController

        skip_after_action :verify_authorized

        def create
          @product_feedback = ProductFeedback.new(product_feedback_params)

          if @product_feedback.valid?
            event = {
              event: 'product feedback created',
              properties: {
                source: 'cl2-back',
                **@product_feedback.attributes.symbolize_keys
              }
            }

            if current_user
              event[:user_id] = current_user.id
            else
              event[:anonymous_id] = SecureRandom.base64
            end

            PublishRawEventToSegmentJob.perform_later(event)
            head 200
          else
            render json: { errors: @product_feedback.errors.details }, status: :unprocessable_entity
          end
        end

        def secure_controller?
          false
        end

        private

        def product_feedback_params
          params
            .require(:product_feedback)
            .permit(:question, :answer, :path, :locale, :email, :message)
        end

      end
    end
  end
end
