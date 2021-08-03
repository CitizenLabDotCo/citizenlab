# frozen_string_literal: true

module Insights
  class TextNetwork < ::ApplicationRecord
    belongs_to :view, class_name: 'Insights::View'

    validates :network, presence: true
    validates :view, presence: true
    validates :language, presence: true, uniqueness: { scope: [:view_id] }
  end
end
