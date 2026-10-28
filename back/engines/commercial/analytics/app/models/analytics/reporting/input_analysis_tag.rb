# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_analysis_tags
#
#  id          :uuid             primary key
#  input_id    :uuid
#  analysis_id :uuid
#  project_id  :uuid
#  phase_id    :uuid
#  tag_id      :uuid
#  tag_label   :string
#  tag_type    :string
#  auto_tagged :boolean
#  created_at  :datetime
#
module Analytics
  module Reporting
    class InputAnalysisTag < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_analysis_tags'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per tag the platform's AI analysis gave an input. Not the same
          tags as reporting_input_tags: these belong to one analysis of one
          project or phase, made by an admin-triggered auto-tagging run or by
          hand, and admins can edit them. They don't cover every input, and the
          same label can mean different things in different analyses, so never
          compare them across analyses. Use them as a starting point and to
          check your own coding, not as authoritative counts.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The tagged input.',
          'analysis_id' => <<~DOC.squish,
            The analysis the tag belongs to. A project or phase can have several
            analyses; group on it to keep their tags apart.
          DOC
          'project_id' => 'The project the analysis covers, also for analyses of a single phase.',
          'phase_id' => 'The phase the analysis covers, or NULL when it covers the whole project.',
          'tag_id' => 'The tag, unique to its analysis. Group on it to count inputs per tag.',
          'tag_label' => <<~DOC.squish,
            The tag name. For 'sentiment' tags, 'sentiment +' (positive) or
            'sentiment -' (negative); inputs judged neutral have no sentiment
            tag. For 'language' tags, the detected language.
          DOC
          'tag_type' => <<~DOC.squish,
            How the tag was made: 'custom' (by an admin), 'platform_topic' (the
            platform's input topics), 'nlp_topic' (topics found by AI),
            'sentiment', 'controversial', 'language' or 'onboarding_example'.
          DOC
          'auto_tagged' => 'TRUE when an auto-tagging run added this tag to the input, FALSE when an admin did.',
          'created_at' => 'When the tag was added to the input (UTC).'
        }
      end

      def self.foreign_keys
        {
          'input_id' => 'reporting_inputs.id',
          'project_id' => 'reporting_projects.id',
          'phase_id' => 'reporting_phases.id'
        }
      end
    end
  end
end
