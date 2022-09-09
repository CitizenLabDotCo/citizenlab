# == Schema Information
#
# Table name: analytics_dimension_locales
#
#  id   :uuid             not null, primary key
#  name :string
#
module Analytics
  class DimensionLocale < Analytics::ApplicationRecord
    # has_and_belongs_to_many :visits, class_name: 'FactVisit'
  end
end
