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
          Use it to say how a project compares with the rest of the platform,
          for example "312 participants, against a platform median of 140". It
          names no project. Counts projects that are not drafts, not hidden and
          whose first phase has started; projects with no participation count
          as 0. All time, not a phase's dates: compare it with a project's own
          totals, not with a phase's. A metric is missing when fewer than 5
          projects stand behind it.
        DOC
      end

      def self.field_descriptions
        {
          'metric' => <<~DOC.squish,
            What is measured: 'participants_per_project' (distinct participants),
            'contributions_per_project' (every row of reporting_contributions: inputs,
            comments, reactions, votes and the rest, so voting projects run high),
            'visitors_per_project' (distinct resident visitors, staff left out),
            'phases_per_project', 'online_voters_per_voting_phase' or
            'survey_responses_per_survey_phase' (inputs only, not comments made during
            the survey).
          DOC
          'median' => 'The middle value across the projects (or phases).',
          'mean' => 'The average value across the projects (or phases).',
          'p25' => 'The 25th percentile across the projects (or phases), interpolated.',
          'p75' => 'The 75th percentile across the projects (or phases), interpolated.',
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
