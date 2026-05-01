# frozen_string_literal: true

module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :title_multiloc, :jsonb

    backed_by_query <<~SQL.squish
      SELECT id, title_multiloc FROM projects
    SQL
  end
end
