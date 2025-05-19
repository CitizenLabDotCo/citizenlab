# frozen_string_literal: true

module ParticipationMethod
  class CommunityMonitorSurvey < NativeSurvey
    ALLOWED_EXTRA_FIELD_TYPES = %w[page sentiment_linear_scale]

    def self.method_str
      'community_monitor_survey'
    end

    def allowed_extra_field_input_types
      ALLOWED_EXTRA_FIELD_TYPES
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      [
        page_field(custom_form, 'quality_of_life'),
        sentiment_field(custom_form, 'place_to_live', 'quality_of_life'),
        sentiment_field(custom_form, 'sense_of_safety', 'quality_of_life'),
        sentiment_field(custom_form, 'access_to_parks', 'quality_of_life'),
        sentiment_field(custom_form, 'affordable_housing', 'quality_of_life'),
        sentiment_field(custom_form, 'employment_opportunities', 'quality_of_life'),
        page_field(custom_form, 'service_delivery'),
        sentiment_field(custom_form, 'quality_of_services', 'service_delivery'),
        sentiment_field(custom_form, 'overall_value', 'service_delivery'),
        sentiment_field(custom_form, 'cleanliness_and_maintenance', 'service_delivery'),
        page_field(custom_form, 'governance_and_trust'),
        sentiment_field(custom_form, 'trust_in_government', 'governance_and_trust'),
        sentiment_field(custom_form, 'responsiveness_of_officials', 'governance_and_trust'),
        sentiment_field(custom_form, 'transparency_of_money_spent', 'governance_and_trust'),
        end_page_field(custom_form, multiloc_service)
      ]
    end

    # Default category names are locked
    def constraints
      {
        page_quality_of_life: { locks: { title_multiloc: true } },
        page_service_delivery: { locks: { title_multiloc: true } },
        page_governance_and_trust: { locks: { title_multiloc: true } }
      }
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

    def supports_multiple_phase_reports?
      true
    end

    private

    def page_field(custom_form, key)
      CustomField.new(
        id: SecureRandom.uuid,
        key: "page_#{key}",
        code: "page_#{key}",
        title_multiloc: multiloc_service.i18n_to_multiloc("custom_fields.community_monitor.question_categories.#{key}"),
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default'
      )
    end

    def sentiment_field(custom_form, key, category)
      CustomField.new(
        id: SecureRandom.uuid,
        key: key,
        resource: custom_form,
        input_type: 'sentiment_linear_scale',
        maximum: 5,
        ask_follow_up: true,
        title_multiloc: multiloc_service.i18n_to_multiloc("custom_fields.community_monitor.questions.#{key}.title"),
        question_category: category,
        linear_scale_label_1_multiloc: multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.labels.label_1'),
        linear_scale_label_2_multiloc: multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.labels.label_2'),
        linear_scale_label_3_multiloc: multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.labels.label_3'),
        linear_scale_label_4_multiloc: multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.labels.label_4'),
        linear_scale_label_5_multiloc: multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.labels.label_5')
      )
    end

    def end_page_field(custom_form, multiloc_service)
      end_page = super
      end_page.page_button_link = '/'
      end_page.page_button_label_multiloc = multiloc_service.i18n_to_multiloc('custom_fields.community_monitor.form_end.button_text')
      end_page
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
