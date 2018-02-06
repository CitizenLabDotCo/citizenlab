class WebApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :participation_method, :start_at, :end_at, :created_at, :updated_at

  #ParticipationContext attributes
  attributes :participation_method, :posting_enabled, :commenting_enabled, :voting_enabled, :voting_method, :voting_limited_max, :form_id
  
  belongs_to :project
end
