# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim surveys component ──▶ Go Vocal native-survey form: a `CustomForm` bound to the survey
    # phase, plus a `CustomField` per question (and `CustomFieldOption`s for choice/ranking questions).
    #
    # The export carries no survey *responses*, so only the form is rebuilt. The native-survey phase
    # itself is created by {PhaseProjector} (registered under the component uid); this extractor hangs
    # the form off it. A Go Vocal survey form opens with a start `page` and closes with an end `page`
    # (mirroring `ParticipationMethod::NativeSurvey#default_fields`), with the questions in between.
    #
    # `matrix_single` questions become `matrix_linear_scale` fields (answer options → scale points,
    # rows → matrix statements); because the export omits the row *text*, the rows are imported as
    # placeholders to relabel. Question types with no faithful native-survey equivalent (e.g.
    # `matrix_multiple`) are skipped and logged rather than dropped silently.
    class SurveysExtractor < BaseExtractor
      QUESTION_TYPE_TO_INPUT_TYPE = {
        'short_answer' => 'text',
        'long_answer' => 'multiline_text',
        'single_option' => 'select',
        'multiple_option' => 'multiselect',
        'sorting' => 'ranking',
        'files' => 'file_upload',
        'title_and_description' => 'page',
        'matrix_single' => 'matrix_linear_scale'
      }.freeze
      OPTION_INPUT_TYPES = %w[select multiselect ranking].freeze
      MATRIX_INPUT_TYPE = 'matrix_linear_scale'
      # Go Vocal linear/matrix scales support 2–11 scale points.
      LINEAR_SCALE_RANGE = (2..11)

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows.filter_map { |row| build_survey(row) }
      end

      private

      def build_survey(component_row)
        component_uid = present_value(component_row['uid'])
        return nil if component_uid.nil?

        phase = ref_map.fetch(component_uid)
        if phase.nil?
          @skipped << { uid: component_uid, reason: 'no survey phase' }
          return nil
        end

        form = Record.new('custom_form', {})
        form.reference('participation_context', phase)
        ref_map.register("#{component_uid}-form", form)

        build_fields(form, component_uid, SurveyParser.questions(component_row['specific_data']))
        form
      end

      # A leading start page, the supported questions, then a trailing end page — all ordered.
      def build_fields(form, component_uid, questions)
        ordering = 0
        register_page(form, "#{component_uid}-page-start", 'page1', ordering)
        ordering += 1
        questions.each do |question|
          ordering += 1 if register_question(form, component_uid, question, ordering)
        end
        register_page(form, "#{component_uid}-page-end", 'form_end', ordering, end_page: true)
      end

      def register_question(form, component_uid, question, ordering)
        input_type = QUESTION_TYPE_TO_INPUT_TYPE[present_value(question['question_type'])]
        unless input_type
          @skipped << { uid: "#{component_uid}-q#{question['id']}",
                        reason: "unsupported question type: #{question['question_type']}" }
          return false
        end

        return register_matrix_question(form, component_uid, question, ordering) if input_type == MATRIX_INPUT_TYPE

        field = Record.new('custom_field', question_attributes(input_type, question, ordering))
        field.reference('resource', form)
        ref_map.register("#{component_uid}-field-#{question['id']}", field)

        build_options(field, component_uid, question) if OPTION_INPUT_TYPES.include?(input_type)
        true
      end

      # Decidim `matrix_single` → Go Vocal `matrix_linear_scale`: the answer options become the scale
      # points (labels + `maximum`), and the rows become matrix statements. The export omits the row
      # *text* (only a `matrix_rows_count`), so the rows are created as placeholders for an admin to
      # relabel once the real row content is available.
      def register_matrix_question(form, component_uid, question, ordering)
        columns = Array(question['answer_options'])
        unless LINEAR_SCALE_RANGE.cover?(columns.size)
          @skipped << { uid: "#{component_uid}-q#{question['id']}",
                        reason: "matrix scale of #{columns.size} outside #{LINEAR_SCALE_RANGE}" }
          return false
        end

        field = Record.new('custom_field', matrix_attributes(question, columns, ordering))
        field.reference('resource', form)
        ref_map.register("#{component_uid}-field-#{question['id']}", field)

        build_matrix_statements(field, component_uid, question)
        true
      end

      def matrix_attributes(question, columns, ordering)
        attributes = question_attributes(MATRIX_INPUT_TYPE, question, ordering)
        attributes['maximum'] = columns.size
        columns.each_with_index do |column, index|
          attributes["linear_scale_label_#{index + 1}_multiloc"] = multiloc(column['body'])
        end
        attributes
      end

      # Placeholder rows: the export carries the row count but not the row labels. One statement per
      # row (at least one), titled with a bracketed index so it's obviously a placeholder to relabel.
      def build_matrix_statements(field, component_uid, question)
        count = [present_value(question['matrix_rows_count']).to_i, 1].max
        locales = matrix_statement_locales(question)
        count.times do |index|
          attributes = {
            'key' => "statement_#{index + 1}",
            'ordering' => index,
            'title_multiloc' => locales.index_with { "[#{index + 1}]" }
          }
          record = Record.new('custom_field_matrix_statement', attributes)
          record.reference('custom_field', field)
          ref_map.register("#{component_uid}-statement-#{question['id']}-#{index + 1}", record)
        end
      end

      def matrix_statement_locales(question)
        locales = multiloc(question['body']).keys
        locales.empty? ? [primary_locale] : locales
      end

      def question_attributes(input_type, question, ordering)
        attributes = {
          'key' => "field_#{question['id']}",
          'input_type' => input_type,
          'title_multiloc' => multiloc(question['body']),
          'description_multiloc' => multiloc(question['description']),
          'required' => truthy?(question['mandatory']),
          'ordering' => ordering,
          'enabled' => true
        }
        attributes['page_layout'] = 'default' if input_type == 'page'
        attributes
      end

      def register_page(form, ref_key, key, ordering, end_page: false)
        attributes = {
          'key' => key, 'input_type' => 'page', 'page_layout' => 'default',
          'title_multiloc' => {}, 'description_multiloc' => {}, 'ordering' => ordering, 'enabled' => true
        }
        attributes['include_in_printed_form'] = false if end_page
        page = Record.new('custom_field', attributes)
        page.reference('resource', form)
        ref_map.register(ref_key, page)
      end

      def build_options(field, component_uid, question)
        Array(question['answer_options']).each_with_index do |option, index|
          attributes = {
            'key' => "option_#{option['id']}",
            'title_multiloc' => multiloc(option['body']),
            'ordering' => index
          }
          record = Record.new('custom_field_option', attributes)
          record.reference('custom_field', field)
          ref_map.register("#{component_uid}-option-#{option['id']}", record)
        end
      end
    end
  end
end
