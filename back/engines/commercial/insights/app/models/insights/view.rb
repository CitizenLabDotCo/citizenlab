# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_views
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_views_on_name  (name)
#
module Insights
  class View < ::ApplicationRecord
    has_many :data_sources, class_name: 'Insights::DataSource', dependent: :destroy
    has_many :source_projects, through: :data_sources, source: :origin, source_type: 'Project'

    has_many :categories, -> { order(position: :desc) }, class_name: 'Insights::Category', dependent: :destroy
    has_many :category_assignments, through: :categories, source: :assignments

    has_many :text_networks, class_name: 'Insights::TextNetwork', dependent: :destroy
    has_many :tna_tasks_views, class_name: 'Insights::TextNetworkAnalysisTaskView', dependent: :destroy

    has_many(
      :processed_flags,
      class_name: 'Insights::ProcessedFlag',
      dependent: :destroy
    )

    validates :name, presence: true, uniqueness: true

    accepts_nested_attributes_for :data_sources

    def scope
      data_sources.first.origin
    end

    def scope_id
      data_sources.first.origin_id
    end
  end
end
