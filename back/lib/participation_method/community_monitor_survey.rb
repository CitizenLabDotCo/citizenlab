# frozen_string_literal: true

module ParticipationMethod
  class CommunityMonitorSurvey < NativeSurvey
    def self.method_str
      'community_monitor_survey'
    end

    def allowed_extra_field_input_types
      %w[page sentiment_linear_scale]
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      [
        page_field(custom_form, 'page1'),
        sentiment_field(custom_form, 'place_to_live', 'quality_of_life'),
        page_field(custom_form, 'page2'),
        sentiment_field(custom_form, 'sense_of_safety', 'quality_of_life'),
        page_field(custom_form, 'page3'),
        sentiment_field(custom_form, 'access_to_parks', 'quality_of_life'),
        page_field(custom_form, 'page4'),
        sentiment_field(custom_form, 'affordable_housing', 'quality_of_life'),
        page_field(custom_form, 'page5'),
        sentiment_field(custom_form, 'employment_opportunities', 'quality_of_life'),
        page_field(custom_form, 'page6'),
        sentiment_field(custom_form, 'quality_of_services', 'service_delivery'),
        page_field(custom_form, 'page7'),
        sentiment_field(custom_form, 'overall_value', 'service_delivery'),
        page_field(custom_form, 'page8'),
        sentiment_field(custom_form, 'cleanliness_and_maintenance', 'service_delivery'),
        page_field(custom_form, 'page9'),
        sentiment_field(custom_form, 'trust_in_government', 'governance_and_trust'),
        page_field(custom_form, 'page10'),
        sentiment_field(custom_form, 'responsiveness_of_officials', 'governance_and_trust'),
        page_field(custom_form, 'page11'),
        sentiment_field(custom_form, 'transparency_of_money_spent', 'governance_and_trust'),
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

    def supports_event_attendance?
      false
    end

    def supports_custom_field_categories?
      true
    end

    private

    def page_field(custom_form, key)
      CustomField.new(
        id: SecureRandom.uuid,
        key: key,
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default'
      )
    end

    def sentiment_field(custom_form, key, topic_code)
      CustomField.new(
        id: SecureRandom.uuid,
        key: key,
        resource: custom_form,
        input_type: 'sentiment_linear_scale',
        title_multiloc: multiloc_service.i18n_to_multiloc("custom_fields.community_monitor.#{key}.title"),
        topic: Topic.find_by(code: topic_code)
      )
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
