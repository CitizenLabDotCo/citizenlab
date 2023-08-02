# frozen_string_literal: true

class WebApi::V1::CosponsorsInitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :status, :user_id, :initiative_id
end
