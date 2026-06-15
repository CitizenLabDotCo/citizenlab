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
    # Question types that have no faithful native-survey equivalent the template can carry — notably
    # `matrix_single` (needs matrix-statement records with no template serializer) — are skipped and
    # logged rather than dropped silently.
    class SurveysExtractor < BaseExtractor
      QUESTION_TYPE_TO_INPUT_TYPE = {
        'short_answer' => 'text',
        'long_answer' => 'multiline_text',
        'single_option' => 'select',
        'multiple_option' => 'multiselect',
        'sorting' => 'ranking',
        'files' => 'file_upload',
        'title_and_description' => 'page'
      }.freeze
      OPTION_INPUT_TYPES = %w[select multiselect ranking].freeze

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

        field = Record.new('custom_field', question_attributes(input_type, question, ordering))
        field.reference('resource', form)
        ref_map.register("#{component_uid}-field-#{question['id']}", field)

        build_options(field, component_uid, question) if OPTION_INPUT_TYPES.include?(input_type)
        true
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
