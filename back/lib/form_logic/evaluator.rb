# frozen_string_literal: true

module FormLogic
  # Walks a compiled program for one set of answers.
  #
  # Program (key space, produced by Compiler, serialized to the FE as-is):
  #   {
  #     "pages":  [{ "key": "page_1", "fields": ["q1", "q2"],
  #                  "jumps": [{ "when": Cond, "goto": "page_3" | "end" }],
  #                  "next": "page_2" | "end" | null }],
  #     "fields": { "q1": { "required": true, "display": Cond?, "required_if": Cond? } }
  #   }
  #   Cond = { "all": [Cond] } | { "any": [Cond] } | { "not": Cond }
  #        | { "key": "q1", "op": "one_of", "value": ["option_key"] }
  #
  # Semantics, identical in interpret.ts:
  # - Jumps are first-match; no match means `next`; `next: null` means the following page.
  # - A target that is not further down the form ends the walk (Validator rejects these).
  # - Conditions only see answers to fields that were visible on the path so far, so an
  #   answer left behind on a hidden question or skipped page never triggers anything.
  class Evaluator
    Result = Struct.new(:path, :visible_keys, :required_keys, :answers, keyword_init: true)

    def initialize(program)
      @pages = program.fetch('pages')
      @fields = program.fetch('fields', {})
      @page_index = @pages.each_with_index.to_h { |page, index| [page['key'], index] }
    end

    def evaluate(answers)
      answers = answers.to_h.transform_keys(&:to_s)
      result = Result.new(path: [], visible_keys: [], required_keys: [], answers: {})
      index = 0

      while index
        page = @pages[index]
        result.path << page['key']
        page['fields'].each { |key| visit_field(key, answers, result) }
        index = next_index(page, index, result.answers)
      end

      result
    end

    # Convenience for results/exports: was this question shown to this respondent?
    def seen?(key, answers)
      evaluate(answers).visible_keys.include?(key)
    end

    private

    def visit_field(key, answers, result)
      field = @fields.fetch(key, {})
      return if field['display'] && !Conditions.match?(field['display'], result.answers)

      result.visible_keys << key
      result.answers[key] = answers[key] if answers.key?(key)
      required = field['required'] ||
        (field['required_if'] && Conditions.match?(field['required_if'], result.answers))
      result.required_keys << key if required
    end

    def next_index(page, index, seen_answers)
      jump = page.fetch('jumps', []).find { |j| Conditions.match?(j['when'], seen_answers) }
      target = jump ? jump['goto'] : page['next']
      return nil if target == END_TARGET

      target_index = target.nil? ? index + 1 : @page_index[target]
      return nil if target_index.nil? || target_index <= index || target_index >= @pages.size

      target_index
    end
  end
end
