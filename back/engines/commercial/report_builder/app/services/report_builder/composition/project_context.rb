# frozen_string_literal: true

module ReportBuilder
  module Composition
    # The facts about a project that the report composer is allowed to write from,
    # and the record ids it is allowed to point a chart at.
    #
    # Rendered as plain text for the prompt rather than JSON: it is read by a model,
    # not parsed, and prose costs fewer tokens than quoted keys.
    #
    # The ids matter as much as the prose. A chart widget takes a project, phase,
    # survey question or registration field id, and the query behind it raises on an
    # id that does not exist — so the model is given the real ones here and held to
    # them by +allowed_ids+.
    class ProjectContext
      # Question types the survey result widget can chart. Mirrors
      # SURVEY_QUESTION_INPUT_TYPES in the report builder's frontend constants.
      CHARTABLE_QUESTION_TYPES = %w[
        select multiselect linear_scale rating multiselect_image matrix_linear_scale
        sentiment_linear_scale ranking point line polygon text multiline_text
      ].freeze

      # Registration field types the demographics widget can chart. Mirrors
      # INPUT_TYPES in the demographics widget's settings.
      CHARTABLE_FIELD_TYPES = %w[select number].freeze

      # @param phase [Phase, nil] the one phase the report is about, when it is a
      #   phase report. A project report covers every phase and passes nil.
      def initialize(project, locale:, phase: nil)
        @project = project
        @locale = locale
        @phase = phase
      end

      def to_prompt_text
        <<~TEXT
          Project: #{localize(@project.title_multiloc)}
          #{scope_line}
          Project period: #{project_period}
          startAt: #{period_bounds.first || '(unknown)'}
          endAt: #{period_bounds.last || 'null'}

          Project description (verbatim from the platform, may be empty):
          #{description.presence || '(none)'}

          ## Ids you may use

          Never invent an id. A widget may only carry ids from this list; anything else
          is rejected. If a list below is empty, the widget that needs it has nothing to
          show and must be left out of the report.

          projectId: #{@project.id}

          Phases (phaseId), in order:
          #{phase_lines}

          Survey questions you may chart (questionId), with the phase they belong to:
          #{survey_question_lines.presence || '(none — leave the survey widget out)'}

          Registration fields you may chart (customFieldId):
          #{demographic_field_lines.presence || '(none — leave the demographics widget out)'}
        TEXT
      end

      # The id values each widget prop may carry, for the validator to enforce.
      # @return [Hash{String => Array<String>}]
      def allowed_ids
        {
          'projectId' => [@project.id],
          'phaseId' => phases.map(&:id),
          'questionId' => survey_questions.values.flatten.map(&:id),
          'customFieldId' => demographic_fields.map(&:id)
        }
      end

      def survey_questions?
        survey_questions.values.any?(&:present?)
      end

      def demographic_fields?
        demographic_fields.any?
      end

      # The phases whose ideas the "most reacted ideas" widget can rank.
      def ideation_phase?
        phases.any? { |phase| phase.participation_method == 'ideation' }
      end

      private

      def phases
        @phases ||= @project.phases.to_a
      end

      def scope_line
        return 'The report covers the whole project, all phases together.' if @phase.nil?

        "Reported phase: #{localize(@phase.title_multiloc)} " \
          "(#{@phase.participation_method}), #{phase_period(@phase)}"
      end

      def localize(multiloc)
        return '' if multiloc.blank?

        multiloc[@locale].presence || multiloc.values.find(&:present?).to_s
      end

      # A project's description lives in its page-builder layout, not on the record;
      # description_preview_multiloc is the short teaser and stands in when the
      # layout has no text yet.
      def description
        text = localize(ContentBuilder::BuildableDescriptionService.new.description_multiloc(@project))
        text = localize(@project.description_preview_multiloc) if text.blank?
        ActionController::Base.helpers.strip_tags(text).squish
      end

      def phase_period(phase)
        return 'no dates set' if phase.start_at.blank?

        "#{phase.start_at.to_date.iso8601} to #{phase.end_at ? phase.end_at.to_date.iso8601 : 'ongoing'}"
      end

      # The project has no dates of its own; its period is the span of its phases.
      def period_bounds
        starts = phases.filter_map(&:start_at)
        return [nil, nil] if starts.empty?
        return [starts.min.to_date.iso8601, nil] if phases.any? { |phase| phase.end_at.blank? }

        [starts.min.to_date.iso8601, phases.filter_map(&:end_at).max.to_date.iso8601]
      end

      def project_period
        start_at, end_at = period_bounds
        return 'no dates set' if start_at.nil?

        "#{start_at} to #{end_at || 'ongoing'}"
      end

      def phase_lines
        phases.map do |phase|
          marker = phase.id == @phase&.id ? ' <- the phase this report is about' : ''
          "- #{localize(phase.title_multiloc)} (#{phase.participation_method}), " \
            "#{phase_period(phase)} — phaseId: #{phase.id}#{marker}"
        end.join("\n")
      end

      # Survey questions per phase, only the types the widget knows how to chart.
      def survey_questions
        @survey_questions ||= phases.to_h do |phase|
          fields = phase.pmethod.supports_survey_form? ? chartable_fields(phase) : []
          [phase, fields]
        end
      end

      def chartable_fields(phase)
        form = phase.custom_form
        return [] if form.nil?

        form.custom_fields.where(input_type: CHARTABLE_QUESTION_TYPES).to_a
      end

      def survey_question_lines
        survey_questions.flat_map do |phase, fields|
          fields.map do |field|
            "- #{localize(field.title_multiloc)} (#{field.input_type}) — " \
              "questionId: #{field.id}, phaseId: #{phase.id}"
          end
        end.join("\n")
      end

      def demographic_fields
        @demographic_fields ||= CustomField
          .registration
          .enabled
          .where(input_type: CHARTABLE_FIELD_TYPES)
          .to_a
      end

      def demographic_field_lines
        demographic_fields.map do |field|
          "- #{localize(field.title_multiloc)} — customFieldId: #{field.id}"
        end.join("\n")
      end
    end
  end
end
