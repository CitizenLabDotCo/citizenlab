# frozen_string_literal: true

# Development-only endpoint for manually triggering an SMS send. Route is
# only mounted when Rails.env.development?, so this can never be hit in
# staging or production.
module WebApi
  module V1
    module Sms
      class SendsController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized
        skip_after_action :verify_policy_scoped

        def create
          delivery = ::Sms::Sender.new.send(
            to: params.require(:phone_number),
            body: params.require(:body),
            provider: (params[:provider] || ::Sms::Sender::DEFAULT_PROVIDER).to_sym
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
