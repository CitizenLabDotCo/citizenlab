# frozen_string_literal: true

module FormLogic
  # Looks at the engine's logic without answers: where a page can lead, which pages no
  # respondent can reach, which jumps use a question. For the form builder's logic overview
  # and warnings, the results logic overlay and the printed routing instructions.
  class Describer
    def initialize(fields, logic)
      @fields = fields.map { |field| Field.wrap(field) }.select(&:enabled)
      @logic = logic || {}
      @pages = @fields.select(&:page?)
      @page_position = @pages.each_with_index.to_h { |page, index| [page.id, index] }
    end

    # The targets a page can lead to, in order: its jumps, then its default.
    def static_targets(page_id)
      logic = @logic[page_id] || {}
      targets = Array(logic['jumps']).pluck('goto')
      default = logic['next'] || @pages[@page_position.fetch(page_id) + 1]&.id
      (targets + [default]).compact.uniq
    end

    # Pages that no combination of answers can reach. Unknown and backward targets end the
    # walk, so they reach nothing.
    def unreachable_page_ids
      return [] if @pages.empty?

      reached = Set[@pages.first.id]
      @pages.each do |page|
        next unless reached.include?(page.id)

        static_targets(page.id).each do |target|
          target = end_page_id if target == END_TARGET
          reached << target if target && @page_position.fetch(target, -1) > @page_position[page.id]
        end
      end
      @pages.map(&:id).reject { |id| reached.include?(id) }
    end

    # The jumps whose condition uses the question: [{ page_id:, index:, jump: }].
    def jumps_using(question_id)
      @logic.flat_map do |page_id, logic|
        Array(logic['jumps']).each_with_index.filter_map do |jump, index|
          uses = ReferenceWalker.references('jumps' => [jump])[:fields].include?(question_id)
          { page_id: page_id, index: index, jump: jump } if uses
        end
      end
    end

    private

    def end_page_id
      (@fields.find(&:user_page?) || @fields.find(&:form_end?))&.id
    end
  end
end
