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

      # The answer field(s) per exported field (form questions + user fields),
      # expanding matrix questions and appending "other"/follow-up answers via the
      # shared answer builder. Redaction is applied per field, so redacting a
      # question also drops its matrix statements and free-text answers.
      def fields
        @fields ||= Export::InputFields.new(phase).all
          .reject { |field| @redacted_field_keys.include?(field.key) }
          .flat_map { |field| answer_fields_builder.fields_for(field) }
      end

      def answer_fields_builder
        @answer_fields_builder ||= Export::AnswerFieldsForReport.new(Export::Xlsx::ValueVisitor)
      end

      def inputs
        @inputs ||= phase.inputs_for_export
          .order(created_at: :asc)
          # Eager-load everything the value visitor reads per input: the author
          # (for author-scoped user fields), input topics, and file attachments.
          .includes(:author, :input_topics, :idea_files, :attached_files, file_attachments: :file)
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
        phase.inputs_for_export.count
      end
    end
  end
end
