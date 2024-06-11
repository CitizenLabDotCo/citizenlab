# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_additional_custom_fields
#
#  id              :uuid             not null, primary key
#  analysis_id     :uuid             not null
#  custom_field_id :uuid             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_analysis_additional_custom_fields_on_analysis_id      (analysis_id)
#  index_analysis_additional_custom_fields_on_custom_field_id  (custom_field_id)
#  index_analysis_analyses_custom_fields                       (analysis_id,custom_field_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (analysis_id => analysis_analyses.id)
#  fk_rails_...  (custom_field_id => custom_fields.id)
#
module Analysis
  class AdditionalCustomField < ApplicationRecord
    belongs_to :analysis, class_name: 'Analysis::Analysis'
    belongs_to :custom_field

    validates :analysis, :custom_field, presence: true

    default_scope -> { order(created_at: :asc) }
  end
end
