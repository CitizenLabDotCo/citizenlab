# frozen_string_literal: true

module FormLogic
  # Every rewrite of ids inside one field's logic: copies, temporary ids from the form builder,
  # deleted options, questions and pages. References only live in fixed places (a condition's
  # `field`, the option ids in a list `value`, a jump's `goto`, a page's `next`), so one
  # walker serves all of them. Never changes its input.
  #
  # A rule (a jump, `display` or `required_if`) that loses part of its condition is dropped as a
  # whole, rather than reinterpreted: removing a part of an `all` would make it broader, and
  # removing a part of an `any` or `not` would change what it means.
  module ReferenceWalker
    RULE_KEYS = %w[display required_if].freeze

    module_function

    def references(logic)
      refs = { fields: [], options: [], pages: [] }
      each_condition(logic) { |condition| collect(condition, refs) }
      refs[:pages].concat(targets(logic))
      refs.transform_values(&:uniq)
    end

    def remap(logic, id_map)
      map = ->(id) { id_map.fetch(id, id) }
      rewrite(logic, page: ->(target) { target == END_TARGET ? target : map.call(target) }) do |condition|
        map_leaves(condition) do |leaf|
          remapped = leaf.merge('field' => map.call(leaf['field']))
          remapped['value'] = leaf['value'].map { |v| v.is_a?(String) ? map.call(v) : v } if list_value?(leaf)
          remapped
        end
      end
    end

    def drop_option(logic, option_id)
      rewrite(logic) do |condition|
        map_leaves(condition) do |leaf|
          next leaf unless list_value?(leaf) && leaf['value'].include?(option_id)
          next nil if leaf['op'] == 'contains_all'

          values = leaf['value'] - [option_id]
          values.empty? ? nil : leaf.merge('value' => values)
        end
      end
    end

    # A deleted question or page.
    def drop_field(logic, field_id)
      rewrite(logic, page: ->(target) { target == field_id ? nil : target }) do |condition|
        map_leaves(condition) { |leaf| leaf['field'] == field_id ? nil : leaf }
      end
    end

    # Rewrites every rule's condition with the block (nil drops the rule) and every target
    # with `page` (nil drops the jump or the page default).
    def rewrite(logic, page: ->(target) { target })
      result = {}
      jumps = Array(logic['jumps']).filter_map do |jump|
        condition = yield(jump['when'])
        target = page.call(jump['goto'])
        { 'when' => condition, 'goto' => target } if condition && target
      end
      result['jumps'] = jumps if jumps.any?
      result['next'] = page.call(logic['next']) if logic['next']
      result.delete('next') if result.key?('next') && result['next'].nil?
      RULE_KEYS.each do |key|
        condition = logic[key] && yield(logic[key])
        result[key] = condition if condition
      end
      result
    end

    # Rebuilds a condition from its leaves; nil when any leaf maps to nil.
    def map_leaves(condition, &block)
      return nil unless condition.is_a?(Hash)

      %w[all any].each do |group|
        next unless condition.key?(group)

        parts = Array(condition[group]).map { |part| map_leaves(part, &block) }
        return parts.all? ? { group => parts } : nil
      end
      return (part = map_leaves(condition['not'], &block)) && { 'not' => part } if condition.key?('not')

      yield condition.deep_dup
    end

    def each_condition(logic, &block)
      Array(logic['jumps']).each { |jump| each_leaf(jump['when'], &block) }
      RULE_KEYS.each { |key| each_leaf(logic[key], &block) }
    end

    def each_leaf(condition, &block)
      return unless condition.is_a?(Hash)

      group = %w[all any].find { |key| condition.key?(key) }
      if group
        Array(condition[group]).each { |part| each_leaf(part, &block) }
      elsif condition.key?('not')
        each_leaf(condition['not'], &block)
      else
        yield condition
      end
    end

    def collect(leaf, refs)
      refs[:fields] << leaf['field'] if leaf['field']
      refs[:options].concat(leaf['value'].grep(String)) if list_value?(leaf)
    end

    def targets(logic)
      (Array(logic['jumps']).pluck('goto') + [logic['next']]).compact - [END_TARGET]
    end

    def list_value?(leaf)
      Conditions::LIST_OPERATORS.include?(leaf['op']) && leaf['value'].is_a?(Array)
    end
  end
end
