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
#  lift        :float            not null
#  p_value     :float            not null
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
    INDEX_TYPES = [CustomField, CustomFieldOption, Tag].freeze
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

    # x_bin_value's are used in case the row or column represents a value or
    # range of values for a custom field that is not using CustomFieldOptions.
    # In such case, the row and/or column is associated with a CustomField, the
    # bin_value represents the starting value for the range of the bin.
    # For example, if `row` is a number custom field and row_bin_value is
    # 10, then the bin represents the range [10, next_bin_value).
    with_options numericality: { only_integer: true, greater_than_or_equal_to: 0 }, presence: true do
      validates :row_bin_value, if: :row_bin?
      validates :column_bin_value, if: :column_bin?
    end
    validates :row_bin_value, absence: true, unless: :row_bin?
    validates :column_bin_value, absence: true, unless: :column_bin?

    scope :with_min_lift_diff, lambda { |min_lift_diff|
      where('abs(1 - lift) * 100 >= ?', min_lift_diff)
    }

    scope :significant, ->(max_p_value = 0.05) { where(p_value: ..max_p_value) }

    def row_bin?
      row_type == 'CustomField'
    end

    def column_bin?
      column_type == 'CustomField'
    end
  end
end
