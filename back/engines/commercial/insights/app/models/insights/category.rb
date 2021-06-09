# frozen_string_literal: true

module Insights
  class Category < ::ApplicationRecord
    belongs_to :view
    has_many :assignments, class_name: 'Insights::CategoryAssignment', dependent: :destroy

    acts_as_list scope: :view

    validates :name, presence: true, uniqueness: { scope: :view }
    validates :view, presence: true
  end
end
