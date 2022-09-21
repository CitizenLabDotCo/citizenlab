# == Schema Information
#
# Table name: analytics_dimension_channels
#
#  id            :uuid             not null, primary key
#  name_multiloc :jsonb
#
module Analytics
  class DimensionChannel < Analytics::ApplicationRecord
  end
end
