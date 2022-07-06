# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_dates
#
#  date  :date             not null, primary key
#  year  :string
#  month :string
#  day   :string
#
module Analytics
  class DimensionDate < Analytics::ApplicationRecord
    self.primary_key = :date
    has_many :posts, class_name: 'PostActivity'
    has_many :participations, class_name: 'ParticipationActivity'
  end
end
