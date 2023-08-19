# frozen_string_literal: true

module Analysis
  module Insightable
    extend ActiveSupport::Concern

    included do
      delegate :analysis, :filters, :inputs_ids, to: :insight

      has_one :insight, as: :insightable, touch: true

      accepts_nested_attributes_for :insight
    end
  end
end
