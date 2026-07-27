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

      # The full export column set (id, form questions, author, meta and user
      # fields), assembled by the builder shared with the xlsx export. Redaction
      # is applied per field, so redacting a question also drops its matrix
      # statements and free-text answers.
      def fields
        @fields ||= Export::InputReportFields
          .new(phase, redacted_field_keys: @redacted_field_keys)
          .all
      end

      def inputs
        @inputs ||= phase.inputs_for_export
          .order(created_at: :asc)
          .includes(*Export::InputReportFields::EAGER_LOADS)
          .to_a
      end

      def respondents
        inputs.map.with_index do |input, index|
          {
            number: index + 1,
            date: I18n.l(input.created_at.to_date),
            answers: fields.map do |field|
              { question: field.column_header, answer: format_answer(field.value_from(input)) }
            end
          }
        end
      end

      # Timestamps read as Time objects for the xlsx cell format; render them
      # as localized dates in the pdf.
      def format_answer(value)
        case value
        when ActiveSupport::TimeWithZone, Time, DateTime
          I18n.l(value.to_date)
        else
          value.to_s
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
