class WebApi::V1::Fast::EventSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :location_multiloc, :start_at, :end_at, :created_at, :updated_at

  belongs_to :project
end