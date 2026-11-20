# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_platform_baselines
#
#  metric           :text
#  median           :float
#  mean             :float
#  p25              :float
#  p75              :float
#  projects_counted :integer
#
module Analytics
  module Reporting
    class PlatformBaseline < Analytics::ApplicationRecordView
      self.table_name = 'reporting_platform_baselines'
      self.primary_key = nil

      include ScopedView

      # Aggregates over the whole platform, never one project's figures: the same
      # for every scope, so a project report can compare itself with the platform.
      def self.for_projects(_project_ids) = all

      def self.table_description
        <<~DOC.squish
          The platform as a baseline, one row per metric: the median, mean and
          quartiles of a measure across the platform's projects (or phases).
          Use it to say how the project compares with the rest of the platform,
          for example "312 participants, against a platform median of 140". It
          is the only view that reaches beyond this project, and it holds no
          other project's figures. Counts projects that are not drafts and whose
          first phase has started; projects with no participation count as 0. A
          metric is missing when fewer than 5 projects stand behind it.
        DOC
      end

      def self.field_descriptions
        {
          'metric' => <<~DOC.squish,
            What is measured: 'participants_per_project', 'contributions_per_project',
            'visitors_per_project' (distinct resident visitors, staff left out),
            'phases_per_project', 'online_voters_per_voting_phase' or
            'survey_responses_per_survey_phase'.
          DOC
          'median' => 'The middle value across the projects (or phases).',
          'mean' => 'The average value across the projects (or phases).',
          'p25' => 'The value a quarter of the projects (or phases) are at or below.',
          'p75' => 'The value three quarters of the projects (or phases) are at or below.',
          'projects_counted' => <<~DOC.squish
            How many projects stand behind the figure. For the per-phase metrics,
            the projects the phases belong to.
          DOC
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
