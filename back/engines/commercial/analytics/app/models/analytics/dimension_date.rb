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
    validates :date, presence: true
    validates :year, presence: true
    validates :month, presence: true
    validates :week, presence: true

    def self.table_description
      <<~DOC.squish
        Date dimension with one row per calendar date, used to bucket facts by day, week, month
        or year. Join a fact dimension_date_*_id to this date column. Dates are calendar dates in
        UTC and are not adjusted to the tenant timezone.
      DOC
    end

    def self.field_descriptions
      {
        'date' => 'Calendar date and primary key. Target of the fact dimension_date_*_id foreign keys.',
        'year' => 'Year as text, for example 2026.',
        'month' => 'Month as YYYY-MM text, for example 2026-06.',
        'week' => 'Date of the Monday that starts the week containing this date (the week bucket).'
      }
    end
  end
end
