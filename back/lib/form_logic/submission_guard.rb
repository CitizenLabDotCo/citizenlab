# frozen_string_literal: true

module FormLogic
  # What the server should store for a submitted response: drops answers to questions the
  # respondent did not see (and their `_other` / `_follow_up` texts) and, when publishing,
  # finds required questions on the respondent's path that are unanswered.
  #
  # In shadow mode it changes nothing and only reports what it would have done, so it can run
  # next to the current behaviour until both agree.
  #
  # values: the response's custom field values, keyed by field key. Keys that are not questions
  # of the form (such as user fields that are not in the form) are passed through.
  class SubmissionGuard
    MODES = %i[shadow enforce].freeze
    COMPANION_SUFFIXES = %w[_other _follow_up].freeze

    Result = Data.define(:values, :errors, :dropped_keys, :missing_required_keys)

    def initialize(fields, logic: nil, mode: :shadow)
      raise ArgumentError, "Unknown mode #{mode.inspect}" unless MODES.include?(mode)

      @fields = fields.map { |field| Field.wrap(field) }
      @program = FormLogic.compile(@fields, logic)
      @mode = mode
      @questions_by_key = @fields.select { |field| field.question? && field.enabled }.index_by(&:key)
    end

    def call(values, publishing:)
      walk = SurveyWalker.new(@program).walk(answers_by_id(values))
      visible = walk.visible_ids.to_set
      dropped = values.keys.select { |key| (id = question_id(key)) && visible.exclude?(id) }
      missing = publishing ? missing_required_keys(walk, values) : []

      if @mode == :shadow
        Result.new(values: values, errors: {}, dropped_keys: dropped, missing_required_keys: missing)
      else
        Result.new(
          values: values.except(*dropped),
          errors: missing.index_with { [{ error: 'blank' }] },
          dropped_keys: dropped,
          missing_required_keys: missing
        )
      end
    end

    private

    def answers_by_id(values)
      values.each_with_object({}) do |(key, value), answers|
        question = @questions_by_key[key]
        answers[question.id] = value if question
      end
    end

    # The question a key answers, for its own key and its companion texts.
    def question_id(key)
      return @questions_by_key[key].id if @questions_by_key.key?(key)

      suffix = COMPANION_SUFFIXES.find { |s| key.end_with?(s) }
      suffix && @questions_by_key[key.delete_suffix(suffix)]&.id
    end

    def missing_required_keys(walk, values)
      keys_by_id = @questions_by_key.values.to_h { |question| [question.id, question.key] }
      walk.required_ids.uniq.filter_map do |id|
        key = keys_by_id[id]
        key unless answered?(values[key])
      end
    end

    def answered?(value)
      return value.values.any? { |v| answered?(v) } if value.is_a?(Hash)
      return value.strip.present? if value.is_a?(String)

      Conditions.present?(value)
    end
  end
end
