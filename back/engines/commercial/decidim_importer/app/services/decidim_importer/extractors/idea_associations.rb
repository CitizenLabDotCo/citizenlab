# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared idea-join helpers for the extractors that turn Decidim items into ideas (proposals,
    # accountability results): the `ideas_phase` link that surfaces the idea in its ideation phase, and
    # the `ideas_input_topic` tag linking it to its category's `InputTopic`.
    module IdeaAssociations
      private

      def register_ideas_phase(uid, idea, phase)
        join = Record.new('ideas_phase', {})
        join.reference('idea', idea)
        join.reference('phase', phase)
        ref_map.register("#{uid}-ideas-phase", join)
      end

      # Tags the idea with the input topic imported from `category_uid`. No-op when there's no category
      # or it wasn't imported as an `input_topic`.
      def register_input_topic(uid, idea, category_uid)
        topic = ref_map.fetch(present_value(category_uid))
        return unless topic&.model_name == 'input_topic'

        join = Record.new('ideas_input_topic', {})
        join.reference('idea', idea)
        join.reference('input_topic', topic)
        ref_map.register("#{uid}-ideas-input-topic", join)
      end
    end
  end
end
