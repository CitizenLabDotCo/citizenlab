# frozen_string_literal: true

class WebApi::V1::CosponsorsInitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :user_id, :initiative_id, :status

  belongs_to :user
  belongs_to :initiative
end
