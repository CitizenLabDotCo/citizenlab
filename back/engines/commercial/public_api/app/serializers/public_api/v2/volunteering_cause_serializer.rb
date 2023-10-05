# frozen_string_literal: true

class PublicApi::V2::VolunteeringCauseSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :title,
    :description,
    :project_id,
    :phase_id,
    :volunteers_count,
    :created_at,
    :updated_at

  multiloc_attributes(
    :title_multiloc,
    :description_multiloc
  )

  def project_id
    object.participation_context.project_id
  end

  def phase_id
    object.participation_context_id if object.participation_context_type == 'Phase'
  end
end
