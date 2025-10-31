# frozen_string_literal: true

module Webhooks
  module WebApi
    module V1
      class WebhookSubscriptionSerializer < ::WebApi::V1::BaseSerializer
        attributes :name, :url, :events, :enabled, :created_at, :updated_at

        attribute :masked_secret_token do |object|
          # Only show first/last 4 characters for security
          token = object.secret_token
          "#{token[0...4]}...#{token[-4..]}"
        end

        attribute :secret_token, if: proc { |_, params|
          params && params[:include_secret_token]
        }

        attribute :deliveries_count do |object|
          object.deliveries.count
        end

        attribute :recent_delivery_stats do |object|
          recent_deliveries = object.deliveries.where('created_at > ?', 24.hours.ago)
          {
            total: recent_deliveries.count,
            succeeded: recent_deliveries.succeeded.count,
            failed: recent_deliveries.failed.count,
            pending: recent_deliveries.pending.count
          }
        end

        belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
      end
    end
  end
end
