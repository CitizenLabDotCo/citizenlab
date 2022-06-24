# == Schema Information
#
# Table name: analytics_dimension_projects
#
#  id             :uuid
#  title_multiloc :jsonb
#
module Analytics
  class DimensionProject < Analytics::ApplicationRecord
    self.primary_key = :id
    has_many :fact_activity, class_name: "FactActivity"
  end
end
