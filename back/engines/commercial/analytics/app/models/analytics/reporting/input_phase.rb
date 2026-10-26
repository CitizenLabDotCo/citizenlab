# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_phases
#
#  id         :uuid             primary key
#  input_id   :uuid
#  phase_id   :uuid
#  created_at :datetime
#
module Analytics
  module Reporting
    class InputPhase < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_phases'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per phase an input belongs to: the link the platform uses to
          show inputs per phase. An input can belong to several phases, for
          example an idea collected in an ideation phase and then put to a vote
          in a voting phase. Survey responses belong to the phase they were
          given in. Use this, not reporting_inputs.creation_phase_id, to
          analyse inputs per phase.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The input.',
          'phase_id' => 'A phase the input belongs to.',
          'created_at' => 'When the input was added to the phase (UTC).'
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id', 'phase_id' => 'reporting_phases.id' }
      end
    end
  end
end
