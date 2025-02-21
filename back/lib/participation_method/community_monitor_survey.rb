# frozen_string_literal: true

module ParticipationMethod
  class CommunityMonitorSurvey < NativeSurvey
    def self.method_str
      'community_monitor_survey'
    end

    def allowed_extra_field_input_types
      %w[page text linear_scale rating select multiselect]
    end

    # TODO: Fields are currently placeholders
    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        start_page_field(custom_form),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'cm_living_in_city',
          resource: custom_form,
          input_type: 'rating',
          maximum: 5,
          title_multiloc: { 'en' => 'How do you rate living in our city?' }
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'cm_council_services',
          resource: custom_form,
          input_type: 'rating',
          maximum: 5,
          title_multiloc: { 'en' => 'How do you rate the quality of council services?' }
        ),
        end_page_field(custom_form, multiloc_service)
      ]
    end

    def constraints
      {} # TODO: Any constraints to be added once we know what the fields are
    end

    def form_logic_enabled?
      false
    end

    def validate_phase
      if phase.project.phases.count > 1
        phase.errors.add(:base, :too_many_phases, message: 'community_monitor project can only have one phase')
      end

      unless phase.project.hidden?
        phase.errors.add(:base, :project_not_hidden, message: 'community_monitor projects must be hidden')
      end

      if phase.end_at.present?
        phase.errors.add(:base, :has_end_at, message: 'community_monitor projects cannot have an end date')
      end
    end
  end
end
