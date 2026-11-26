# frozen_string_literal: true

module FormLogic
  # Turns stored (v1) logic into the engine's logic, reproducing the paths respondents take
  # today, so the engine can replace the old runtime without changing a single path except
  # where a stored rule never worked (see the `divergent` cases in
  # spec/fixtures/form_logic/legacy).
  #
  # v1: questions have `{ "rules": [{ "if": <option id | value | "any_other_answer" |
  # "no_answer">, "goto_page_id": <page id> }] }`, pages have `{ "next_page_id": <page id> }`.
  #
  # Today's runtime, reproduced here:
  # - when any question on a page has rules, the page default is ignored;
  # - of the questions with a matching rule, the last one on the page wins;
  # - of the matching rules of one question, the farthest target wins;
  # - rules on disabled questions are not seen.
  # Returns { page id => { "jumps" => [...], "next" => ... } } and a report of everything
  # that was dropped or looks wrong.
  class LegacyNormalizer
    Result = Struct.new(:logic, :report, keyword_init: true)

    CHOICE_TYPES = %w[select].freeze
    MULTIPLE_CHOICE_TYPES = %w[multiselect multiselect_image].freeze
    SCALE_TYPES = %w[linear_scale rating].freeze
    RANKING_TYPES = %w[ranking].freeze
    SUPPORTED_TYPES = (CHOICE_TYPES + MULTIPLE_CHOICE_TYPES + SCALE_TYPES + RANKING_TYPES).freeze
    OLD_END_TARGET = 'form_end'

    def initialize(fields)
      @fields = fields.map { |field| Field.wrap(field) }.select(&:enabled)
      @pages = @fields.select(&:page?)
      @page_index = @pages.each_with_index.to_h { |page, index| [page.id, index] }
    end

    def call
      @report = []
      logic = pages_with_questions.each_with_object({}) do |(page, questions), result|
        page_logic = normalize_page(page, questions)
        result[page.id] = page_logic if page_logic.any?
      end
      Result.new(logic: logic, report: @report)
    end

    private

    # Like the survey form: disabled fields are left out, so the questions of a disabled page
    # join the page before it, and questions before the first page belong to no page.
    def pages_with_questions
      @fields.each_with_object([]) do |field, pages|
        if field.page?
          pages << [field, []]
        elsif pages.any?
          pages.last.last << field
        end
      end
    end

    def normalize_page(page, questions)
      with_rules = questions.select { |question| rules(question).any? }
      jumps = with_rules.map { |question| question_jumps(question) }.reverse.flatten(1)
      next_page_id = page.logic['next_page_id'].presence

      if next_page_id && with_rules.any?
        report(page, :page_default_ignored, { 'next_page_id' => next_page_id })
        next_page_id = nil
      end

      result = {}
      result['jumps'] = jumps if jumps.any?
      result['next'] = target(page, next_page_id, { 'next_page_id' => next_page_id }) if next_page_id
      result
    end

    def rules(field)
      field.logic.is_a?(Hash) ? Array(field.logic['rules']) : []
    end

    def question_jumps(question)
      unless SUPPORTED_TYPES.include?(question.input_type)
        rules(question).each { |rule| report(question, :unsupported_input_type, rule) }
        return []
      end

      jumps = rules(question).filter_map do |rule|
        condition = condition_for(question, rule)
        { 'when' => condition, 'goto' => target(question, rule['goto_page_id'], rule) } if condition
      end
      jumps.each_with_index.sort_by { |jump, index| [-distance(jump['goto']), index] }.map(&:first)
    end

    def condition_for(question, rule)
      value = rule['if']
      return report(question, :rule_without_value, rule) if value.nil?
      return leaf(question, 'absent') if value == 'no_answer'
      return any_other_answer(question, rule) if value == 'any_other_answer'

      explicit(question, rule)
    end

    def explicit(question, rule)
      value = rule['if']
      case question.input_type
      when *CHOICE_TYPES, *MULTIPLE_CHOICE_TYPES
        return report(question, :unknown_option, rule) unless question.option_ids.include?(value)

        leaf(question, choice_operator(question), [value])
      when *SCALE_TYPES
        number = scale_value(value)
        number ? leaf(question, 'eq', number) : report(question, :invalid_value, rule)
      else
        report(question, :never_fires, rule)
      end
    end

    def any_other_answer(question, rule)
      values = case question.input_type
      when *CHOICE_TYPES, *MULTIPLE_CHOICE_TYPES then question.option_ids - explicit_values(question)
      when *SCALE_TYPES then (1..question.maximum.to_i).to_a - explicit_values(question).filter_map { |v| scale_value(v) }
      else []
      end
      return report(question, :never_fires, rule) if values.empty?

      leaf(question, SCALE_TYPES.include?(question.input_type) ? 'one_of' : choice_operator(question), values)
    end

    def explicit_values(question)
      rules(question).pluck('if').compact - %w[any_other_answer no_answer]
    end

    def choice_operator(question)
      MULTIPLE_CHOICE_TYPES.include?(question.input_type) ? 'contains_any' : 'one_of'
    end

    def scale_value(value)
      return value if value.is_a?(Integer)

      Integer(value, 10) if value.is_a?(String) && value.match?(/\A-?\d+\z/)
    end

    def leaf(question, operator, value = nil)
      { 'field' => question.id, 'op' => operator }.tap { |leaf| leaf['value'] = value unless value.nil? }
    end

    def target(field, page_id, rule)
      return END_TARGET if page_id == OLD_END_TARGET

      if !@page_index.key?(page_id)
        report(field, :unknown_target, rule)
      elsif (source = page_of(field)) && @page_index[page_id] <= @page_index[source.id]
        report(field, :target_not_forward, rule)
      end
      page_id
    end

    def distance(page_id)
      return @pages.size if page_id == END_TARGET

      @page_index.fetch(page_id, -1)
    end

    def page_of(field)
      return field if field.page?

      @fields[0..@fields.index(field)].reverse.find(&:page?)
    end

    def report(field, reason, rule)
      @report << { field_id: field.id, reason: reason, rule: rule }
      nil
    end
  end
end
