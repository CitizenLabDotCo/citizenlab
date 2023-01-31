# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_types
#
#  id     :uuid             not null, primary key
#  name   :string
#  parent :string
#
# Indexes
#
#  index_analytics_dimension_types_on_name_and_parent  (name,parent) UNIQUE
#
module Analytics
  class DimensionType < Analytics::ApplicationRecord
    validates :name, presence: true
  end
end
