# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_locales
#
#  id   :uuid             not null, primary key
#  name :string           not null
#
# Indexes
#
#  index_analytics_dimension_locales_on_name  (name) UNIQUE
#
module Analytics
  class DimensionLocale < Analytics::ApplicationRecord
    validates :name, presence: true, uniqueness: true
  end
end
