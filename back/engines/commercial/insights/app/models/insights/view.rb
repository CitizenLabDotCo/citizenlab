# frozen_string_literal: true

module Insights
  class View < ::ApplicationRecord
    belongs_to :scope, class_name: 'Project'
    has_many :categories, class_name: 'Insights::Category', dependent: :destroy
    has_many :text_networks, class_name: 'Insights::TextNetwork', dependent: :destroy
    has_many :tna_tasks_views, class_name: 'Insights::TextNetworkAnalysisTaskView', dependent: :destroy
    has_many :detected_categories, class_name: 'Insights::DetectedCategory', dependent: :destroy
    has_many(
      :processed_flags,
      class_name: 'Insights::ProcessedFlag',
      dependent: :destroy
    )

    validates :name, presence: true, uniqueness: true
    validates :scope, presence: true
  end
end
