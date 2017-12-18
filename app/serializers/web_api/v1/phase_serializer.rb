class WebApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :consultation_method, :start_at, :end_at, :created_at, :updated_at

  belongs_to :project
end
