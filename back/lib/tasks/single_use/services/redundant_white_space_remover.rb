# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Removes WhiteSpace nodes made redundant by the automatic vertical rhythm on
      # project pages (front: components/admin/ContentBuilder/verticalRhythm.ts).
      # A spacer sitting between two widgets now stacks its own height on top of the
      # automatic gap, roughly doubling the space admins complained about.
      #
      # Removable: a spacer (or run of consecutive spacers) with a kept sibling on
      # both sides. Kept, and returned for human review instead:
      # - `withDivider: true` — renders a visible divider line: content, not spacing;
      # - size `large` — tall enough that it likely marks deliberate separation;
      # - leading/trailing spacers — page padding the rhythm does not replace;
      # - anything unexpectedly carrying children.
      #
      # Pure JSON-in/JSON-out so the rake task owns all reporting and writing.
      class RedundantWhiteSpaceRemover
        WHITE_SPACE = 'WhiteSpace'

        Result = Struct.new(:json, :removed, :review, keyword_init: true)

        def call(craftjs_json)
          json = deep_copy(craftjs_json)
          removed = []
          review = []

          json.each do |parent_id, parent|
            children = parent['nodes']
            next unless children.is_a?(Array) && children.any? { |id| white_space?(json[id]) }

            removable_runs(json, children, review, parent_id).each do |run|
              run.each do |id|
                removed << removal_entry(json, children, id, parent_id)
              end
              children -= run
              run.each { |id| json.delete(id) }
            end
            parent['nodes'] = children
          end

          Result.new(json: json, removed: removed, review: review)
        end

        private

        def white_space?(node)
          node.is_a?(Hash) && node.dig('type', 'resolvedName') == WHITE_SPACE
        end

        def removable?(node)
          white_space?(node) &&
            !node.dig('props', 'withDivider') &&
            node.dig('props', 'size') != 'large' &&
            node['nodes'].blank? &&
            node['linkedNodes'].blank?
        end

        def kept_reason(node)
          return 'has_children' if node['nodes'].present? || node['linkedNodes'].present?
          return 'divider' if node.dig('props', 'withDivider')

          'large' if node.dig('props', 'size') == 'large'
        end

        # Maximal runs of consecutive removable spacers, bounded on both sides by a
        # kept sibling. Unbounded runs (touching the start or end of the children
        # array) and kept spacers land on the review list.
        def removable_runs(json, children, review, parent_id)
          runs = children.slice_when { |a, b| removable?(json[a]) != removable?(json[b]) }.to_a

          runs.filter_map do |run|
            if removable?(json[run.first])
              next run if run.first != children.first && run.last != children.last

              reason = run.first == children.first ? 'leading' : 'trailing'
              run.each { |id| review << review_entry(json, id, parent_id, reason) }
            else
              run.each do |id|
                reason = white_space?(json[id]) && kept_reason(json[id])
                review << review_entry(json, id, parent_id, reason) if reason
              end
            end
            nil
          end
        end

        def removal_entry(json, children, id, parent_id)
          index = children.index(id)
          {
            id: id,
            parent_id: parent_id,
            size: json[id].dig('props', 'size').presence || 'small',
            previous_widget: nearest_kept_widget(json, children, index, -1),
            next_widget: nearest_kept_widget(json, children, index, 1)
          }
        end

        # The nearest sibling in `direction` that will survive the removal, named for
        # the report so a run can be checked against the page.
        def nearest_kept_widget(json, children, index, direction)
          cursor = index + direction
          while cursor.between?(0, children.size - 1)
            node = json[children[cursor]]
            return node.dig('type', 'resolvedName') || node['type'] unless removable?(node)

            cursor += direction
          end
          nil
        end

        def review_entry(json, id, parent_id, reason)
          {
            id: id,
            parent_id: parent_id,
            size: json[id].dig('props', 'size').presence || 'small',
            reason: reason
          }
        end

        def deep_copy(json)
          JSON.parse(JSON.generate(json))
        end
      end
    end
  end
end
