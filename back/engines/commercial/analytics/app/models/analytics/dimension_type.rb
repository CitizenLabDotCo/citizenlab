# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_types
#
#  id(Primary key. Target of fact dimension_type_id foreign keys.)                                                                                                                                                                                               :uuid             not null, primary key
#  name(Type name. One of idea, proposal, comment, reaction, poll, volunteer, survey, basket, event_attendance or follower.)                                                                                                                                     :string
#  parent(Category the type applies to: post for idea and proposal; idea or proposal for comment; idea or comment for reaction; the followed entity (for example project or phase) for follower; NULL for poll, volunteer, survey, basket and event_attendance.) :string
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
