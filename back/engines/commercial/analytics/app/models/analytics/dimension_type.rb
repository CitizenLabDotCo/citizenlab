# == Schema Information
#
# Table name: analytics_dimension_types
#
#  id     :uuid             not null, primary key
#  name   :string
#  parent :string
#
module Analytics
  class DimensionType < Analytics::ApplicationRecord
    has_many :fact_activity, class_name: "FactActivity"
  end
end
