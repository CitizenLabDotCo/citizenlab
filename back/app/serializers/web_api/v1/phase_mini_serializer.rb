class WebApi::V1::PhaseMiniSerializer < WebApi::V1::BaseSerializer
  attributes :end_at, :participation_method, :input_term

  %i[
    voting_method native_survey_button_multiloc
  ].each do |attribute_name|
    attribute attribute_name, if: proc { |phase|
      phase.pmethod.supports_serializing?(attribute_name)
    }
  end

  attribute :action_descriptors do |phase, params|
    user_requirements_service = params[:user_requirements_service] || Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    Permissions::PhasePermissionsService.new(phase, current_user(params), user_requirements_service:, request: params[:request]).action_descriptors
  end

  belongs_to :project
  has_one :report, serializer: ReportBuilder::WebApi::V1::ReportSerializer
end
