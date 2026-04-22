class WebApi::V1::PhaseMiniSerializer < WebApi::V1::BaseSerializer
  attributes :participation_method, :input_term

  attribute :end_at, &:end_date

  %i[
    voting_method native_survey_button_multiloc
  ].each do |attribute_name|
    attribute attribute_name, if: proc { |phase|
      phase.pmethod.supports_serializing?(attribute_name)
    }
  end

  belongs_to :project
  has_one :report, serializer: ReportBuilder::WebApi::V1::ReportSerializer
end
