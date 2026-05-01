# frozen_string_literal: true

module Analytics
  class DimensionStatus < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :title_multiloc, :jsonb
    attribute :code, :string
    attribute :color, :string

    backed_by_query <<~SQL.squish
      SELECT id, title_multiloc, code, color FROM idea_statuses
    SQL
  end
end
