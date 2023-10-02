# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_insights
#
#  id               :uuid             not null, primary key
#  analysis_id      :uuid             not null
#  insightable_type :string           not null
#  insightable_id   :uuid             not null
#  filters          :jsonb            not null
#  inputs_ids       :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  bookmarked       :boolean          default(FALSE)
#
# Indexes
#
#  index_analysis_insights_on_analysis_id  (analysis_id)
#  index_analysis_insights_on_insightable  (insightable_type,insightable_id)
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#
module Analysis
  class Insight < ::ApplicationRecord
    include HasFilters

    belongs_to :analysis, class_name: 'Analysis::Analysis'
    delegated_type :insightable, types: %w[Analysis::Summary Analysis::Question], dependent: :destroy

    validate :inputs_ids_unique

    def inputs_ids_unique
      return if inputs_ids.blank?

      if inputs_ids.uniq != inputs_ids
        errors.add(:inputs_ids, :should_have_unique_ids, message: 'The log of inputs_ids associated with the summary contains duplicate ids')
      end
    end
  end
end
