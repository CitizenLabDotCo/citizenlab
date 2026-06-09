# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_projects
#
#  id             :uuid             primary key
#  title_multiloc :jsonb
#
module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    self.primary_key = :id

    def self.table_description
      <<~DOC.squish
        Project dimension with descriptive attributes for projects (participation containers).
      DOC
    end

    def self.field_descriptions
      {
        'id' => 'Project primary key. Target of fact dimension_project_id foreign keys.',
        'title_multiloc' => <<~DOC.squish
          Project title as a multiloc JSON object keyed by locale, for example {"en": "Budget 2026"}.
          Read one locale with the ->> operator, for example title_multiloc->>'en'.
        DOC
      }
    end
  end
end
