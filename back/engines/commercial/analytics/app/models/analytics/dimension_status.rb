# frozen_string_literal: true

module Analytics
  class DimensionStatus < Analytics::ApplicationRecordView
    self.table_name = 'idea_statuses'
    self.primary_key = :id

    attribute :id, :string
    attribute :title_multiloc, :jsonb
    attribute :code, :string
    attribute :color, :string
  end
end
