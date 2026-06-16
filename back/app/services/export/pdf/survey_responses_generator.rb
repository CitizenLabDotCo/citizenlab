# frozen_string_literal: true

module Export
  module Pdf
    # Builds the "survey responses" PDF: a branded cover page followed by one
    # card per response. Answers are formatted with the shared export field
    # visitor (so every question type is supported consistently with the xlsx
    # export), and rendered to PDF via Gotenberg (HTML -> Chromium).
    class SurveyResponsesGenerator
      def initialize(phase, cover:, redacted_field_keys: [])
        @phase = phase
        @cover = cover
        @redacted_field_keys = Array(redacted_field_keys).to_set
      end

      def generate_pdf
        GotenbergClient.new.render_html_to_pdf(render_html)
      end

      # Renders just the cover page as HTML for the live preview, reusing the
      # same template/locals as the full PDF (single source of truth).
      def render_cover_html
        render_template(
          'export/pdf/cover',
          cover: cover,
          total: published_count,
          colors: palette
        )
      end

      private

      attr_reader :phase, :cover

      def fields
        @fields ||= Export::Pdf::SurveyFields.new(phase).fields
          .filter_map do |field|
            next if @redacted_field_keys.include?(field.key)

            Export::CustomFieldForExport.new(field, Export::Pdf::ValueVisitor)
          end
      end

      def inputs
        @inputs ||= phase.ideas.supports_survey.published
          .order(created_at: :asc)
          .includes(:idea_files, file_attachments: :file)
          .to_a
      end

      def respondents
        inputs.map.with_index do |input, index|
          {
            number: index + 1,
            date: I18n.l(input.created_at.to_date),
            answers: fields.map do |field|
              { question: field.column_header, answer: field.value_from(input).to_s }
            end
          }
        end
      end

      def render_html
        render_template(
          'export/pdf/survey_responses',
          cover: cover,
          respondents: respondents,
          total: inputs.size,
          colors: palette
        )
      end

      def render_template(template, **locals)
        ActionController::Base.new.render_to_string(
          template: template,
          layout: false,
          locals: locals
        )
      end

      def palette
        Export::Pdf::BrandColors.palette
      end

      # Cheap count for the cover preview (avoids loading every response).
      def published_count
        phase.ideas.supports_survey.published.count
      end
    end
  end
end
