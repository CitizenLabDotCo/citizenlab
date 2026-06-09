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

    def self.table_description
      <<~DOC.squish
        Type dimension describing the kind of participation. Referenced by
        analytics_fact_participations.dimension_type_id (and other facts). Each row is a
        (name, parent) pair.
      DOC
    end

    def self.field_descriptions
      {
        'id' => 'Primary key. Target of fact dimension_type_id foreign keys.',
        'name' => <<~DOC.squish,
          Type name. One of idea, proposal, comment, reaction, poll, volunteer, survey, basket,
          event_attendance or follower.
        DOC
        'parent' => <<~DOC.squish
          Category the type applies to: post for idea and proposal; idea or proposal for comment;
          idea or comment for reaction; the followed entity (for example project or phase) for
          follower; NULL for poll, volunteer, survey, basket and event_attendance.
        DOC
      }
    end
  end
end
