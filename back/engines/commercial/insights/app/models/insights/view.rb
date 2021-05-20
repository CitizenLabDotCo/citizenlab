# frozen_string_literal: true

module Insights
  class View < ::ApplicationRecord
    belongs_to :scope, class_name: 'Project'

    validates :name, presence: true, uniqueness: true
    validates :scope, presence: true
  end
end
