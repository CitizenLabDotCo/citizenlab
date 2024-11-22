class WebApi::V1::PhaseMiniSerializer < WebApi::V1::BaseSerializer
  # So for the new widgets using the light project card, I need the following attributes:
  #   end_at
  #   participation_method
  #   voting_method
  #   input_term
  #   native_survey_button_multiloc
  # Plus the report relationship, which does not need to be included.

  attributes :end_at, :participation_method, :input_term

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
