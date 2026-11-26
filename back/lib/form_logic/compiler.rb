# frozen_string_literal: true

module FormLogic
  # Turns the engine's logic (option ids, as stored) into the program the walkers run (option
  # answer keys). The only place that knows option ids apart from answer keys, so the walkers
  # need no knowledge of input types.
  #
  # - Like the survey form, disabled fields are left out: questions of a disabled page join the
  #   page before it, and questions before the first page are on no page.
  # - "end" and the end page become the user fields page when the form has one, otherwise the
  #   end page, so the user fields page can never be skipped.
  # - A rule that uses a field that is not in the program is dropped as a whole, and so is a
  #   rule whose option list has no known options left. Targets are kept as they are; the
  #   walkers end the walk on an unknown or backward target.
  class Compiler
    def initialize(fields, logic)
      @fields = fields.map { |field| Field.wrap(field) }.select(&:enabled)
      @logic = logic || {}
      @questions = @fields.select(&:question?).index_by(&:id)
    end

    def call
      pages = []
      questions = {}

      @fields.each do |field|
        if field.page?
          pages << compile_page(field)
        elsif pages.any?
          pages.last['fields'] << field.id
          questions[field.id] = compile_question(field)
        end
      end

      { 'pages' => pages, 'fields' => questions.slice(*pages.flat_map { |page| page['fields'] }) }
    end

    private

    def compile_page(page)
      logic = @logic[page.id] || {}
      compiled = { 'id' => page.id, 'fields' => [] }
      jumps = Array(logic['jumps']).filter_map do |jump|
        condition = compile_condition(jump['when'])
        { 'when' => condition, 'goto' => resolve_target(jump['goto']) } if condition
      end
      compiled['jumps'] = jumps if jumps.any?
      compiled['next'] = resolve_target(logic['next']) if logic['next']
      compiled
    end

    def compile_question(question)
      logic = @logic[question.id] || {}
      compiled = { 'required' => question.required == true }
      %w[display required_if].each do |key|
        condition = logic[key] && compile_condition(logic[key])
        compiled[key] = condition if condition
      end
      compiled
    end

    def compile_condition(condition)
      return nil unless condition.is_a?(Hash)

      %w[all any].each do |group|
        next unless condition.key?(group)

        parts = Array(condition[group]).map { |part| compile_condition(part) }
        return parts.all? ? { group => parts } : nil
      end
      return (part = compile_condition(condition['not'])) && { 'not' => part } if condition.key?('not')

      compile_leaf(condition)
    end

    def compile_leaf(leaf)
      source = @questions[leaf['field']]
      return nil unless source
      return leaf.slice('field', 'op', 'value') unless leaf['value'].is_a?(Array) && source.options.any?

      keys = source.options.index_by(&:id)
      values = leaf['value'].filter_map { |id| keys[id]&.key }
      values.empty? ? nil : leaf.merge('value' => values)
    end

    def resolve_target(target)
      return ending_page_id || target if target == END_TARGET
      return user_page.id if user_page && target == end_page&.id

      target
    end

    def ending_page_id
      (user_page || end_page)&.id
    end

    def user_page
      @user_page ||= @fields.find(&:user_page?)
    end

    def end_page
      @end_page ||= @fields.find(&:form_end?)
    end
  end
end
