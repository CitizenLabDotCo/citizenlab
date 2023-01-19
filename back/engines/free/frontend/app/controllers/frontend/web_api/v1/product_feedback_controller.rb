# frozen_string_literal: true

module Frontend
  module WebApi
    module V1
      class ProductFeedbackController < FrontendController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized

        def create
          @product_feedback = ProductFeedback.new(product_feedback_params)

          if current_user
            @product_feedback.email ||= current_user.email
            @product_feedback.locale ||= current_user.locale
          end

          if @product_feedback.valid?
            event = {
              event: 'ProductFeedback created',
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

            # TODO: Do something with the feedback! Currently it is sent into the void.
            head :ok
          else
            render json: { errors: @product_feedback.errors.details }, status: :unprocessable_entity
          end
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
