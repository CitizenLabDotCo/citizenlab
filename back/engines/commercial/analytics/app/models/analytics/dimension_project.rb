# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_projects
#
#  id             :uuid             primary key
#  title_multiloc :jsonb
#
module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
