# frozen_string_literal: true

# Minimal serializer for exporting native survey responses (submissions).
# Unlike IdeaSerializer it deliberately avoids the expensive per-idea
# permission/action-descriptor computation, exposing only what a survey export
# needs: when it was submitted and the (visible) answers.
class WebApi::V1::SurveySubmissionSerializer < WebApi::V1::BaseSerializer
  attribute :created_at

  attribute :custom_field_values do |idea, params|
    CustomFieldService.remove_not_visible_fields(idea, current_user(params))
  end
end
