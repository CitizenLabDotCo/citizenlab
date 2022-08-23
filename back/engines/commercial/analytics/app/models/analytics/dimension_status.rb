# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_statuses
#
#  id     :uuid             not null, primary key
#  title_multiloc :jsonb
#
module Analytics
  class DimensionStatus < Analytics::ApplicationRecord
    has_many :posts, class_name: 'PostActivity'
  end
end
