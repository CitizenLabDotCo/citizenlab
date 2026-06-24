# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim survey answers (`02---answers.csv` in a surveys component) ──▶ Go Vocal native-survey
    # responses: one `Idea` per answer row, bound to the survey phase via `creation_phase` (native
    # survey is non-transitive, so there's no `ideas_phase` join — unlike proposals), with the answers
    # in `custom_field_values`.
    #
    # The answers CSV has `author` (a Decidim user uid), `author_status`, `created_at`, then one column
    # per question headed by the question uid. Each cell is encoded by question type:
    #   * short/long answer → the plain string;
    #   * single/multiple option, sorting → a JSON array of `{ answer_option, position, custom_body }`;
    #   * matrix → a JSON array of `{ <row uid> => [{ answer_option, … }] }`;
    #   * files → a JSON array of file URLs.
    # Field/option/matrix-statement keys are reproduced from the same {SurveyKeys} the form was built
    # with, so values address the fields {Extractors::SurveysExtractor} created. The survey component
    # rows are parsed here too (for the question structure: option order drives the matrix scale point).
    #
    # Runs after the surveys and users extractors so the phase, project and author records resolve.
    class SurveyResponsesExtractor < BaseExtractor
      COLUMNS = { author: 'author', created_at: 'created_at',
                  process: 'decidim_participatory_process', component: 'decidim_component' }.freeze

      attr_reader :skipped

      def initialize(*, survey_components: [], **)
        super(*, **)
        @survey_components = survey_components
        @skipped = []
      end

      def run
        rows.each_with_index.filter_map { |row, index| build_response(row, index) }
      end

      private

      def build_response(row, index)
        component_uid = present_value(row[COLUMNS[:component]])
        phase = ref_map.fetch(component_uid)
        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        questions = questions_by_component[component_uid]
        if phase.nil? || project.nil? || questions.nil?
          return skip("#{component_uid}-response-#{index}", 'no phase/project/form for response')
        end

        response_uid = "#{component_uid}-response-#{index}"
        idea = Record.new('idea', idea_attributes(row))
        idea.reference('project', project)
        idea.reference('creation_phase', phase)
        author = author_for(row)
        idea.reference('author', author) if author
        ref_map.register(response_uid, idea)

        # Built after registration so file-upload records can reference the (now-registered) idea, then
        # merged into the same attributes hash held by the ref map.
        idea.attributes['custom_field_values'] = answer_values(questions, row, idea, response_uid)
        idea
      end

      def idea_attributes(row)
        created = timestamp(row[COLUMNS[:created_at]])
        { 'publication_status' => 'published', 'created_at' => created, 'published_at' => created,
          'custom_field_values' => {} }
      end

      # The response's author is the imported user matching the `author` uid; left nil (never anonymous)
      # when the uid is blank or its user wasn't imported (e.g. a filtered spam/unconfirmed account).
      def author_for(row)
        uid = present_value(row[COLUMNS[:author]])
        return nil if uid.nil?

        record = ref_map.fetch(uid)
        record if record&.model_name == 'user'
      end

      # Each question's cell encoded into `{ field_key => value }` pairs, merged across questions. The
      # answers CSV is headed by the question id as a string, so the lookup stringifies it (older
      # exports carry numeric question ids that parse as integers).
      def answer_values(questions, row, idea, response_uid)
        questions.each_with_index.with_object({}) do |(question, q_index), values|
          encode_answer(question, row[question['id'].to_s], idea, "#{response_uid}-q#{q_index}")
            .each { |key, value| values[key] = value }
        end
      end

      def encode_answer(question, raw, idea, file_uid)
        key = SurveyKeys.field_key(question['id'])
        case question['question_type']
        when 'short_answer', 'long_answer' then encode_text(key, raw)
        when 'single_option' then encode_choice(key, parse_choices(raw), multiple: false)
        when 'multiple_option' then encode_choice(key, parse_choices(raw), multiple: true)
        when 'sorting' then encode_ranking(key, parse_choices(raw))
        when 'matrix_single' then encode_matrix(key, question, raw)
        when 'files' then encode_files(key, raw, idea, file_uid)
        else {}
        end
      end

      def encode_text(key, raw)
        text = present_value(raw)
        text ? { key => text } : {}
      end

      # A single option key (single choice) or an array of them (multiple choice), plus the free-text
      # `custom_body` of an "other" choice as the field's `_other` companion value.
      def encode_choice(key, choices, multiple:)
        return {} if choices.empty?

        option_keys = choices.filter_map { |choice| choice['answer_option'] && SurveyKeys.option_key(choice['answer_option']) }
        values = {}
        values[key] = multiple ? option_keys : option_keys.first unless option_keys.empty?
        other = choices.filter_map { |choice| present_value(choice['custom_body']) }.first
        values["#{key}_other"] = other if other
        values
      end

      # Ranking: option keys ordered by the answer's `position`.
      def encode_ranking(key, choices)
        ordered = choices.sort_by { |choice| choice['position'].to_i }
          .filter_map { |choice| choice['answer_option'] && SurveyKeys.option_key(choice['answer_option']) }
        ordered.empty? ? {} : { key => ordered }
      end

      # Matrix: `{ statement_key => scale_point }`, where the scale point is the 1-based position of the
      # chosen answer option among the question's answer options (mirroring how the matrix field maps
      # answer options onto its linear-scale labels).
      def encode_matrix(key, question, raw)
        scale = scale_points(question)
        value = {}
        Array(Parsing.parse_json(raw)).each do |row_hash|
          next unless row_hash.is_a?(Hash)

          row_hash.each do |row_uid, choices|
            option = Array(choices).first
            point = option && scale[option['answer_option']]
            value[SurveyKeys.statement_key(row_uid)] = point if point
          end
        end
        value.empty? ? {} : { key => value }
      end

      def scale_points(question)
        Array(question['answer_options']).each_with_index.to_h { |option, index| [option['id'], index + 1] }
      end

      # File answers become Go Vocal `file_upload` records (the `idea_files` model) attached to the
      # response, fetched from their URL at apply time, referenced from the field value by `{ id, name }`.
      # Go Vocal `file_upload` holds a single file, so only the first URL is kept (the rest are logged).
      def encode_files(key, raw, idea, file_uid)
        urls = Array(Parsing.parse_json(raw)).filter_map { |url| present_value(url) }
        return {} if urls.empty?

        skip(file_uid, "kept 1 of #{urls.size} uploaded files") if urls.size > 1
        name = filename_from_url(urls.first)
        file = Record.new('file_upload', {
          'id' => SecureRandom.uuid, 'name' => name, 'ordering' => 0, 'remote_file_url' => urls.first
        })
        file.reference('idea', idea)
        ref_map.register("#{file_uid}-file", file)
        { key => { 'id' => file.attributes['id'], 'name' => name } }
      end

      # The original filename, read from the URL's `content-disposition` (the path itself is an opaque
      # storage token). Falls back to a generic name so the record's required `name` is always present.
      def filename_from_url(url)
        decoded = CGI.unescape(url.to_s)
        name = decoded[/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i, 1]
        present_value(name&.split('/')&.last) || 'attachment'
      end

      def parse_choices(raw)
        Array(Parsing.parse_json(raw)).select { |choice| choice.is_a?(Hash) }
      end

      # Questions indexed by uid per survey component, parsed once from each component's specific_data.
      def questions_by_component
        @questions_by_component ||= @survey_components.each_with_object({}) do |component_row, acc|
          uid = present_value(component_row['uid'])
          acc[uid] = SurveyParser.questions(component_row['specific_data']) if uid
        end
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
