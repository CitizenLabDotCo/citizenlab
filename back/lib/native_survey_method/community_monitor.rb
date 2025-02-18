# frozen_string_literal: true

module NativeSurveyMethod
  class CommunityMonitor < Base
    def allowed_extra_field_input_types
      %w[page text linear_scale rating select multiselect]
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        start_page_field(custom_form),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'cm_living_in_city',
          code: 'cm_living_in_city',
          resource: custom_form,
          input_type: 'rating',
          maximum: 5,
          title_multiloc: { 'en' => 'How do you rate living in our city?' }
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'cm_council_services',
          code: 'cm_council_services',
          resource: custom_form,
          input_type: 'rating',
          maximum: 5,
          title_multiloc: { 'en' => 'How do you rate the quality of council services?' }
        ),
        end_page_field(custom_form, multiloc_service)
      ]
    end

    def constraints
      {
        cm_living_in_city: { locks: { enabled: true, title_multiloc: true, maximum: true } },
        cm_council_services: { locks: { enabled: true, title_multiloc: true, maximum: true } }
      }
    end

    def logic_enabled?
      false
    end

    def follow_project_on_idea_submission?
      false
    end
  end
end
