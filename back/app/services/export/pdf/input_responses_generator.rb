# frozen_string_literal: true

module Export
  module Pdf
    # Builds the "input responses" PDF: a branded cover page followed by one
    # card per response. Answers are formatted with the shared export field
    # visitor (so every question type is supported consistently with the xlsx
    # export), and rendered to PDF via Gotenberg (HTML -> Chromium). Works for
    # any participation method whose pmethod supports_input_pdf_export?.
    class InputResponsesGenerator
      # cover_only renders just the cover page (used by the live preview); it
      # skips loading responses entirely.
      def initialize(phase, cover:, redacted_field_keys: [], cover_only: false)
        @phase = phase
        @cover = cover
        @redacted_field_keys = Array(redacted_field_keys).to_set
        @cover_only = cover_only
      end

      def generate_pdf
        GotenbergClient.new.render_html_to_pdf(render_html)
      end

      private

      attr_reader :phase, :cover

      def fields
        @fields ||= Export::Pdf::InputFields.new(phase).fields
          .filter_map do |field|
            next if @redacted_field_keys.include?(field.key)

            Export::CustomFieldForExport.new(field, Export::Xlsx::ValueVisitor)
          end
      end

      def inputs
        @inputs ||= exportable_inputs
          .order(created_at: :asc)
          .includes(:idea_files, file_attachments: :file)
          .to_a
      end

      # The inputs included in the export. Mirrors the xlsx inputs export:
      # non-survey methods (ideation/proposals) also hold draft/empty rows, so
      # drop content-less inputs there.
      def exportable_inputs
        scope = phase.ideas.submitted_or_published
        scope = scope.with_content unless phase.pmethod.supports_survey_form?
        scope
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
          'export/pdf/input_responses',
          cover: cover,
          respondents: @cover_only ? [] : respondents,
          total: @cover_only ? exportable_count : inputs.size,
          cover_only: @cover_only,
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
      def exportable_count
        exportable_inputs.count
      end
    end
  end
end
