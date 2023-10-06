# frozen_string_literal: true

module Analysis
  module Insightable
    extend ActiveSupport::Concern

    included do
      delegate :analysis, :analysis_id, :filters, :inputs_ids, :bookmarked, to: :insight

      has_one :insight, as: :insightable, touch: true, dependent: :destroy, required: true, inverse_of: :insightable

      accepts_nested_attributes_for :insight
    end
  end
end
