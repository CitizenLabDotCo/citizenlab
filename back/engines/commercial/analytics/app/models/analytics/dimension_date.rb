# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_dates
#
#  date  :date             not null, primary key
#  year  :string
#  month :string
#  week  :date
#
module Analytics
  class DimensionDate < Analytics::ApplicationRecord
    self.primary_key = :date
  end
end
