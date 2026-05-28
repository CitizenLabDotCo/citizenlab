# frozen_string_literal: true

# Development-only endpoint for manually triggering an SMS send. Route is
# only mounted when Rails.env.development?, so this can never be hit in
# staging or production. Runs the job synchronously so the response reflects
# the actual Twilio API call result.
module WebApi
  module V1
    module Sms
      class SendsController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized
        skip_after_action :verify_policy_scoped

        def create
          # Call run directly (not perform_now) so we get the delivery back —
          # Que's perform wrapper doesn't propagate the run method's return value.
          delivery = ::Sms::SendJob.new.run(
            to: params.require(:phone_number),
            body: params.require(:body)
          )

          render json: {
            id: delivery.id,
            status: delivery.status,
            message_sid: delivery.message_sid,
            phone_number: delivery.phone_number
          }, status: :ok
        rescue ::Sms::Error => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
