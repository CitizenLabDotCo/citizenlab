# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_dates
#
#  date(Calendar date and primary key. Target of the fact dimension_date_*_id foreign keys.) :date             not null, primary key
#  year(Year as text, for example 2026.)                                                     :string
#  month(Month as YYYY-MM text, for example 2026-06.)                                        :string
#  week(Date of the Monday that starts the week containing this date (the week bucket).)     :date
#
module Analytics
  class DimensionDate < Analytics::ApplicationRecord
    self.primary_key = :date
    validates :date, presence: true
    validates :year, presence: true
    validates :month, presence: true
    validates :week, presence: true
  end
end
