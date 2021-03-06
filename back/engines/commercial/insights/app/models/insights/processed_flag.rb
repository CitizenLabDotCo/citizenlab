# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_processed_flags
#
#  id         :uuid             not null, primary key
#  input_type :string           not null
#  input_id   :uuid             not null
#  view_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_processed_flags_on_view_id  (view_id)
#  index_processed_flags_on_input             (input_type,input_id)
#  index_single_processed_flags               (input_id,input_type,view_id) UNIQUE
#
module Insights
  class ProcessedFlag < ::ApplicationRecord
    self.table_name = 'insights_processed_flags'

    belongs_to :input, polymorphic: true
    belongs_to :view

    validates :input, presence: true
    validates :input_id, uniqueness: { scope: %i[input_type view], message: 'Flag already exists' }
    validates :view, presence: true
  end
end
