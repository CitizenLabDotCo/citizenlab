# frozen_string_literal: true

class UserFieldsInSurveyService
  def self.merge_idea_and_user_fields(
    current_user,
    phase,
    draft_idea
  )
    if current_user && phase.pmethod.user_fields_in_form? && phase.anonymity != 'full_anonymity'
      user_values = current_user.custom_field_values&.transform_keys do |key| 
        prefix_key(key)
      end

      draft_idea.custom_field_values = user_values.merge(draft_idea.custom_field_values)
    end

    draft_idea
  end

  private

  def self.prefix_key(key)
    "u_#{key}"
  end
end