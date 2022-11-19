# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_statuses
#
#  id             :uuid             primary key
#  title_multiloc :jsonb
#  code           :string
#  color          :string
#
module Analytics
  class DimensionStatus < Analytics::ApplicationRecord
    self.primary_key = :id
  end
end
