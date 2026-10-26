# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_community_monitor_scores
#
#  phase_id          :uuid
#  year              :integer
#  quarter           :integer
#  question_id       :uuid
#  question_label    :text
#  question_category :string
#  staff             :boolean
#  answer_count      :integer
#  answer_sum        :decimal(, )
#  average           :decimal(, )
#
module Analytics
  module Reporting
    class CommunityMonitorScore < Analytics::ApplicationRecordView
      self.table_name = 'reporting_community_monitor_scores'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          Community monitor scores as the community monitor dashboard computes
          them: one row per phase, quarter, sentiment question and author group
          (staff or not). Only published responses to enabled questions count.
          The dashboard's overall and per-category scores pool all answers in
          the group: compute them as ROUND(SUM(answer_sum) / SUM(answer_count), 1),
          never as an average of the per-question averages. A category
          without answers in a quarter has no rows (the dashboard shows 0 for
          it): report it as no data, not as a score of 0. The dashboard
          leaves out answers by admins and moderators only when the platform
          has that setting on, which this model cannot see: filter on
          staff = FALSE to match it in that case, and say which you did.
        DOC
      end

      def self.field_descriptions
        {
          'phase_id' => 'The community monitor survey phase.',
          'year' => 'Year of the quarter, in the platform timezone.',
          'quarter' => <<~DOC.squish,
            Quarter (1-4) the responses were created in, in the platform
            timezone, like the dashboard. Can differ from a quarter computed
            from UTC timestamps for responses near a quarter boundary.
          DOC
          'question_id' => 'The sentiment question (custom field).',
          'question_label' => 'Question text, resolved to the platform primary locale.',
          'question_category' => <<~DOC.squish,
            Theme of the question: 'quality_of_life', 'service_delivery',
            'governance_and_trust' or 'other'. Group on it for per-category scores.
          DOC
          'staff' => <<~DOC.squish,
            TRUE for answers whose author is an admin or moderator now. Anonymous
            answers and answers by deleted users count as FALSE, as on the dashboard.
          DOC
          'answer_count' => 'Number of answers to the question in this group.',
          'answer_sum' => <<~DOC.squish,
            Sum of the answers (each from 1 to the question's maximum, usually 5).
            Use it with answer_count to pool averages across rows.
          DOC
          'average' => 'Average answer for this question and group, rounded to 1 decimal like the dashboard.'
        }
      end

      def self.foreign_keys
        { 'phase_id' => 'reporting_phases.id' }
      end
    end
  end
end
