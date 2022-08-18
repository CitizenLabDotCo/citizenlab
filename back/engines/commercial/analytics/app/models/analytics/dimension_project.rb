# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_projects
#
#  id             :uuid             primary key
#  title_multiloc :jsonb
#
module Analytics
  class DimensionProject < Analytics::ApplicationView
    self.primary_key = :id
    has_many :posts, class_name: 'PostActivity'
    has_many :participations, class_name: 'ParticipationActivity'
  end
end
