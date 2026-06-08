# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_projects
#
#  id(Project primary key. Target of fact dimension_project_id foreign keys.)                                                                                                            :uuid             primary key
#  title_multiloc(Project title as a multiloc JSON object keyed by locale, for example {"en": "Budget 2026"}. Read one locale with the ->> operator, for example title_multiloc->>'en'.) :jsonb
#
module Analytics
  class DimensionProject < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
