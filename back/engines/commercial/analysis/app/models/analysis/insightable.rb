# frozen_string_literal: true

module Analysis
  module Insightable
    extend ActiveSupport::Concern

    included do
      has_one :insight, as: :insightable, touch: true
    end
  end
end
