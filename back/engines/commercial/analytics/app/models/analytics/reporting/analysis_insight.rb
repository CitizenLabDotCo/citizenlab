# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_analysis_insights
#
#  id           :uuid             primary key
#  analysis_id  :uuid
#  project_id   :uuid
#  phase_id     :uuid
#  kind         :text
#  question     :text
#  body         :text
#  filters      :jsonb
#  input_ids    :jsonb
#  accuracy     :float
#  generated_at :datetime
#  created_at   :datetime
#
module Analytics
  module Reporting
    class AnalysisInsight < Analytics::ApplicationRecordView
      self.table_name = 'reporting_analysis_insights'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per insight an admin generated with the platform's AI
          analysis: an AI-written summary of a set of inputs, or a question an
          admin asked about them with the AI's answer. Use them as leads and to
          check your own reading of the inputs, not as findings: they cover
          whatever inputs the admin had filtered when generating them, and are
          not updated when inputs change afterwards.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'analysis_id' => <<~DOC.squish,
            The analysis the insight belongs to (reporting_input_analysis_tags.analysis_id
            says which inputs it covers).
          DOC
          'project_id' => 'The project the analysis covers, also for analyses of a single phase.',
          'phase_id' => 'The phase the analysis covers, or NULL when it covers the whole project.',
          'kind' => "'summary' or 'question'.",
          'question' => 'For a question, what the admin asked. NULL for summaries.',
          'body' => <<~DOC.squish,
            The summary, or the answer to the question, as written by the AI.
            It cites inputs by id in square brackets, for example
            [52247442-b9a9-4a74-a6a1-898e9d6e2da7]: join those to
            reporting_inputs.id to read them, and never show the ids in a report.
            Cited ids should be among input_ids, but the AI can cite others by
            mistake: check each citation against input_ids before relying on it.
            Not screened for personal data: leave out names, contact details
            and addresses when quoting it.
          DOC
          'filters' => <<~DOC.squish,
            The filters the admin had set, as JSON: which inputs the insight
            covers. Keys include 'tag_ids' (reporting_input_analysis_tags.tag_id),
            'search', 'published_at_from'/'published_at_to', reaction, vote and
            comment count ranges, and 'author_custom_<question id>' or
            'input_custom_<question id>' (with '_from'/'_to' for ranges) for
            answers to registration or form questions. {} means all inputs of
            the analysis.
          DOC
          'input_ids' => <<~DOC.squish,
            JSON array of the ids of the inputs the AI was given (join to
            reporting_inputs.id). Its length is the number of inputs the insight
            is based on.
          DOC
          'accuracy' => <<~DOC.squish,
            The platform's rough rating (0 to 1) of how reliable the AI setup
            used was. Treat insights with a low rating with extra care.
          DOC
          'generated_at' => 'When the AI wrote the text (UTC).',
          'created_at' => 'When the admin asked for the insight (UTC).'
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
