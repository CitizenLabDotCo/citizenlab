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
    INDEX_TYPES = [CustomFieldOption, Tag].freeze
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

    def statement_multiloc
      {
        'en' =>
        "People who #{unit} #{col_to_action(row)} #{col_to_action(column)} #{decimal_to_percentage(lift)} than the average."
      }
    end

    private

    def col_to_action(item)
      case item
      when CustomFieldOption
        "respond '#{multiloc_service.t(item.title_multiloc)}' to '#{multiloc_service.t(item.custom_field.title_multiloc)}'"
      when Tag
        "in #{item.name}"
      end
    end

    # Example output
    # decimal_to_percentage(1.1) => '10% more'
    # decimal_to_percentage(0.9) => '10% less'
    # decimal_to_percentage(2.02) => '102% more'
    def decimal_to_percentage(decimal)
      percentage = (decimal - 1) * 100
      if percentage > 0
        "#{percentage.round(0)}% more"
      else
        "#{percentage.abs.round(0)}% less"
      end
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
