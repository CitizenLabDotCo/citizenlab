# frozen_string_literal: true

class PublicApi::V2::BasketSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :user_id,
    :project_id,
    :phase_id,
    :submitted_at,
    :created_at,
    :updated_at

  def project_id
    object.phase.project_id
  end
end
