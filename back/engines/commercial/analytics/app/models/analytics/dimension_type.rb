# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_types
#
#  id     :uuid             not null, primary key
#  name   :string
#  parent :string
#
module Analytics
  class DimensionType < Analytics::ApplicationRecord
    validates :name, presence: true, uniqueness: true
  end
end
