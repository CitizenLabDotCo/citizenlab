# frozen_string_literal: true

module Analysis
  module Insightable
    extend ActiveSupport::Concern

    included do
      delegate :analysis, :analysis_id, :filters, :inputs_ids, to: :insight

      has_one :insight, as: :insightable, touch: true, dependent: :destroy, required: true, inverse_of: :insightable

      accepts_nested_attributes_for :insight

      def missing_inputs_count
        input_ids_then = inputs_ids || []
        input_ids_now = analysis.participation_context.idea_ids
        (input_ids_now - input_ids_then).size
      end
    end
  end
end
