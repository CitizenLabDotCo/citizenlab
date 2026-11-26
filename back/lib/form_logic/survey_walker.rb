# frozen_string_literal: true

module FormLogic
  # Walks a compiled program for one respondent's answers, the way a respondent clicks
  # through the survey.
  #
  # Program (produced by Compiler, sent to the FE as-is; everything is a field id):
  #   {
  #     "pages":  [{ "id": "<page id>", "fields": ["<question id>", ...],
  #                  "jumps": [{ "when": Cond, "goto": "<page id>" | "end" }],
  #                  "next": "<page id>" | "end" | null }],
  #     "fields": { "<question id>": { "required": true, "display": Cond, "required_if": Cond } }
  #   }
  #   Cond = { "all": [Cond] } | { "any": [Cond] } | { "not": Cond }
  #        | { "field": "<question id>", "op": "<operator>", "value": ... }
  #
  # Semantics, identical in walkSurvey.ts:
  # - Jumps are first-match; no match means `next`; `next: null` means the following page.
  # - "end", an unknown page, the current page or an earlier page ends the walk.
  # - Conditions only see answers to questions that were visible on the walk so far, so an
  #   answer left behind on a hidden question or skipped page never triggers anything.
  class SurveyWalker
    Walk = Struct.new(:path, :visible_ids, :required_ids, :answers, keyword_init: true) do
      def to_h
        { 'path' => path, 'visible_ids' => visible_ids, 'required_ids' => required_ids, 'answers' => answers }
      end
    end

    def initialize(program)
      @pages = program.fetch('pages')
      @fields = program.fetch('fields', {}) || {}
      @page_index = @pages.each_with_index.to_h { |page, index| [page['id'], index] }
    end

    # answers: { field id => answer }
    def walk(answers)
      answers = answers.to_h.transform_keys(&:to_s)
      walk = Walk.new(path: [], visible_ids: [], required_ids: [], answers: {})
      index = @pages.empty? ? nil : 0

      while index
        page = @pages[index]
        walk.path << page['id']
        (page['fields'] || []).each { |id| visit_field(id, answers, walk) }
        index = next_index(page, index, walk.answers)
      end

      walk
    end

    private

    def visit_field(id, answers, walk)
      field = @fields[id] || {}
      return if field['display'] && !Conditions.match?(field['display'], walk.answers)

      walk.visible_ids << id
      walk.answers[id] = answers[id] if answers.key?(id)
      required = field['required'] == true ||
                 (field['required_if'] && Conditions.match?(field['required_if'], walk.answers))
      walk.required_ids << id if required
    end

    def next_index(page, index, seen_answers)
      jump = (page['jumps'] || []).find { |j| Conditions.match?(j['when'], seen_answers) }
      target = jump ? jump['goto'] : page['next']
      return nil if target == END_TARGET

      target_index = target.nil? ? index + 1 : @page_index[target]
      return nil if target_index.nil? || target_index <= index || target_index >= @pages.size

      target_index
    end
  end
end
