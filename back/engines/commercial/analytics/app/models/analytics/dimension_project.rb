# frozen_string_literal: true

module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    self.table_name = 'projects'
    self.primary_key = :id

    attribute :id, :string
    attribute :title_multiloc, :jsonb
  end
end
