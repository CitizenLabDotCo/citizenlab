# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_analysis_heatmap_cells
#
#  id                    :uuid             primary key
#  analysis_id           :uuid
#  project_id            :uuid
#  phase_id              :uuid
#  unit                  :string
#  row_kind              :text
#  row_tag_id            :uuid
#  row_tag_label         :string
#  row_question_id       :uuid
#  row_question_label    :text
#  row_answer_label      :text
#  column_kind           :text
#  column_tag_id         :uuid
#  column_tag_label      :string
#  column_question_id    :uuid
#  column_question_label :text
#  column_answer_label   :text
#  count                 :integer
#  lift                  :decimal(20, 15)
#  p_value               :decimal(20, 15)
#  created_at            :datetime
#
module Analytics
  module Reporting
    class AnalysisHeatmapCell < Analytics::ApplicationRecordView
      self.table_name = 'reporting_analysis_heatmap_cells'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per cell of the platform's AutoInsights heatmaps: where views
          diverge between groups. A cell crosses two dimensions of one analysis
          (see reporting_input_analysis_tags): an analysis tag, or one answer
          (or range of answers) to a registration or form question. It counts
          the inputs, likes, dislikes or participants that fall in both, and
          says how far that is above or below what the totals predict. The
          platform only shows cells with p_value <= 0.05 as insights. Cells are
          computed when an admin runs the analysis and are not updated
          afterwards, so they can be out of date. Built on analysis tags, so
          the same limits apply: partial coverage, not comparable across
          analyses.
        DOC
      end

      def self.side_descriptions(side)
        {
          "#{side}_kind" => <<~DOC.squish,
            What the #{side} of the cell is: 'tag' (an analysis tag),
            'registration_question' (an answer from the sign-up form) or
            'form_question' (an answer from the input form).
          DOC
          "#{side}_tag_id" => "For a 'tag' #{side}, the analysis tag; NULL otherwise.",
          "#{side}_tag_label" => "For a 'tag' #{side}, the tag name; NULL otherwise.",
          "#{side}_question_id" => "For a question #{side}, the question (custom field); NULL for tags.",
          "#{side}_question_label" => "For a question #{side}, the question text in the platform primary locale; NULL for tags.",
          "#{side}_answer_label" => <<~DOC.squish
            For a question #{side}, the answer or range of answers the cell is
            about: an option title, the answer values ('true'/'false' for
            checkboxes, points for scales), or a range such as '20 to 40' or '80
            or more'. A range includes its lower bound and excludes its upper
            one: '20 to 40' is 20 up to 39. Ages are in years. NULL for tags.
          DOC
        }
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'analysis_id' => 'The analysis the cell belongs to. Never compare cells across analyses.',
          'project_id' => 'The project the analysis covers, also for analyses of a single phase.',
          'phase_id' => 'The phase the analysis covers, or NULL when it covers the whole project.',
          'unit' => <<~DOC.squish,
            What count counts: 'inputs', 'likes', 'dislikes' or 'participants'.
            Each analysis has a separate set of cells per unit, so always filter
            on one unit.
          DOC
          **side_descriptions('row'),
          **side_descriptions('column'),
          'count' => <<~DOC.squish,
            Number of units in both the row and the column (for example, inputs
            tagged 'Cycling' by authors aged 20 to 40). Small counts can point to
            individuals: don't report cells with only a handful.
          DOC
          'lift' => <<~DOC.squish,
            count divided by the count the row and column totals predict. 1.3
            means 30% more than expected, 0.7 means 30% less, 0 means none.
          DOC
          'p_value' => <<~DOC.squish,
            Chi-square p-value of the link between row and column. The platform
            treats p_value <= 0.05 as significant; ignore other cells when
            claiming a difference.
          DOC
          'created_at' => 'When the heatmap was computed (UTC).'
        }
      end

      def self.foreign_keys
        {
          'project_id' => 'reporting_projects.id',
          'phase_id' => 'reporting_phases.id'
        }
      end
    end
  end
end
