# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_views
#
#  id         :uuid             not null, primary key
#  name       :string           not null
#  scope_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_views_on_name  (name)
#
# Foreign Keys
#
#  fk_rails_...  (scope_id => projects.id)
#
module Insights
  class View < ::ApplicationRecord
    belongs_to :scope, class_name: 'Project'
    has_many :categories, -> { order(position: :desc) }, class_name: 'Insights::Category', dependent: :destroy
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
