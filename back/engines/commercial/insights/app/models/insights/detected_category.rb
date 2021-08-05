# frozen_string_literal: true

module Insights
  class DetectedCategory < ::ApplicationRecord
    belongs_to :view, touch: true

    validates :name, presence: true, uniqueness: { scope: :view }
    validates :view, presence: true
  end
end
