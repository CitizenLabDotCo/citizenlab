# == Schema Information
#
# Table name: analytics_dimension_locales
#
#  id   :uuid             not null, primary key
#  name :string
#
module Analytics
  class DimensionLocale < Analytics::ApplicationRecord
  end
end
