# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_categories
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  view_id      :uuid             not null
#  position     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  inputs_count :integer          default(0), not null
#  source_type  :string
#  source_id    :uuid
#
# Indexes
#
#  index_insights_categories_on_source            (source_type,source_id)
#  index_insights_categories_on_source_type       (source_type)
#  index_insights_categories_on_view_id           (view_id)
#  index_insights_categories_on_view_id_and_name  (view_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (view_id => insights_views.id)
#
module Insights
  class Category < ::ApplicationRecord
    SOURCE_TYPES = [Topic].map(&:name).freeze

    belongs_to :view
    belongs_to :source, polymorphic: true, optional: true
    has_many :assignments, class_name: 'Insights::CategoryAssignment', dependent: :destroy
    has_and_belongs_to_many :tasks,
      class_name: 'Insights::ZeroshotClassificationTask',
      join_table: 'insights_zeroshot_classification_tasks_categories'

    acts_as_list scope: :view

    validates :name, presence: true, uniqueness: { scope: :view_id }
    validates :view, presence: true
    validates :source_type, inclusion: { in: SOURCE_TYPES }, allow_blank: true
  end
end
