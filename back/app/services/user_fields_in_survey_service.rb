# frozen_string_literal: true

class UserFieldsInSurveyService
  def self.merge_idea_and_user_fields(
    current_user,
    phase,
    draft_idea
  )
    if current_user && phase.pmethod.user_fields_in_form?
      user_values = current_user.custom_field_values&.transform_keys { |key| "u_#{key}" }
      draft_idea.custom_field_values = user_values.merge(draft_idea.custom_field_values) if current_user
    end

    draft_idea
  end
end