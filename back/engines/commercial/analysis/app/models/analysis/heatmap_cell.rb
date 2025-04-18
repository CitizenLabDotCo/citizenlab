# == Schema Information
#
# Table name: analysis_heatmap_cells
#
#  id          :uuid             not null, primary key
#  analysis_id :uuid             not null
#  row_type    :string           not null
#  row_id      :uuid             not null
#  column_type :string           not null
#  column_id   :uuid             not null
#  unit        :string           not null
#  count       :integer          not null
#  lift        :decimal(20, 15)  not null
#  p_value     :decimal(20, 15)  not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_analysis_heatmap_cells_on_analysis_id  (analysis_id)
#  index_analysis_heatmap_cells_on_column       (column_type,column_id)
#  index_analysis_heatmap_cells_on_row          (row_type,row_id)
#  index_analysis_heatmap_cells_uniqueness      (analysis_id,row_id,column_id,unit) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class HeatmapCell < ::ApplicationRecord
    INDEX_TYPES = [CustomFieldBin, Tag].freeze
    UNIT_TYPES = %w[inputs likes dislikes participants]

    belongs_to :analysis, class_name: 'Analysis::Analysis'
    belongs_to :row, polymorphic: true
    belongs_to :column, polymorphic: true

    attribute :unit, default: 'inputs'
    attribute :count, default: 0

    validates :unit, inclusion: { in: UNIT_TYPES }
    validates :row_type, :column_type, inclusion: { in: INDEX_TYPES.map(&:name) }
    validates :count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validates :lift, numericality: { greater_than_or_equal_to: 0 }
    validates :p_value, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }

    scope :with_min_lift_diff, lambda { |min_lift_diff|
      where('abs(1 - lift) * 100 >= ?', min_lift_diff)
    }

    scope :significant, ->(max_p_value = 0.05) { where(p_value: ..max_p_value) }
  end
end
