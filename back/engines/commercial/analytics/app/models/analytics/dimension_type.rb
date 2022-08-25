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
    has_many :posts, class_name: 'PostActivity'
    has_many :participations, class_name: 'ParticipationActivity'
  end
end
