# frozen_string_literal: true

module Texting
  class WebApi::V1::CampaignSerializer < ::WebApi::V1::BaseSerializer
    attributes :phone_numbers, :message, :sent_at, :status, :created_at, :updated_at
  end
end
