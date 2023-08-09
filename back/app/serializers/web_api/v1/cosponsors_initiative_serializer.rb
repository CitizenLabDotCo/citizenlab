# frozen_string_literal: true

class WebApi::V1::CosponsorsInitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :user_id, :initiative_id, :status, :created_at, :updated_at
end
