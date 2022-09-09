# == Schema Information
#
# Table name: analytics_dimension_channels
#
#  id            :uuid             not null, primary key
#  name_multiloc :jsonb
#
module Analytics
  class DimensionChannel < Analytics::ApplicationRecord
    # has_many :visits, class_name: 'Analytics::FactVisit'
  end
end
