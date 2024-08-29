# frozen_string_literal: true

class PublicApi::V2::VolunteeringVolunteerSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :volunteering_cause_id,
    :user_id,
    :created_at,
    :updated_at

  def volunteering_cause_id
    object.cause_id
  end
end
