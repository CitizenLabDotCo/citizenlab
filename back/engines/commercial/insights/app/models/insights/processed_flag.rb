# frozen_string_literal: true

module Insights
  class ProcessedFlag < ::ApplicationRecord
    self.table_name = 'insights_processed_flags'

    belongs_to :input, polymorphic: true
    belongs_to :view, touch: true

    validates :input, presence: true
    validates :input_id, uniqueness: { scope: %i[input_type view], message: 'Flag already exists' }
    validates :view, presence: true
  end
end
