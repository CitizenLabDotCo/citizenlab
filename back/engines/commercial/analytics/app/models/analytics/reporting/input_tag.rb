# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_tags
#
#  id            :uuid             primary key
#  input_id      :uuid
#  tag_id        :uuid
#  tag_label     :text
#  parent_tag_id :uuid
#
module Analytics
  module Reporting
    class InputTag < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_tags'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per tag on an input. Tags (also called topics) categorize
          what an input is about and can be nested one level: when reporting
          per tag, roll child tags up into their parent via parent_tag_id.
          An input can carry multiple tags.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key of the input-tag association.',
          'input_id' => 'The tagged input. Joins to reporting_inputs.id.',
          'tag_id' => 'The tag. Multiple rows share a tag_id; group on it to count per tag.',
          'tag_label' => 'Tag name, resolved to the platform primary locale.',
          'parent_tag_id' => 'The parent tag when this tag is a child in a two-level hierarchy, NULL for top-level tags.'
        }
      end
    end
  end
end
