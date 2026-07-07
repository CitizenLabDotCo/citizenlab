# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_statuses
#
#  input_id     :uuid             primary key
#  status_id    :uuid
#  status_label :text
#  status_code  :string
#
module Analytics
  module Reporting
    class InputStatus < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_statuses'
      self.primary_key = :input_id

      def self.table_description
        <<~DOC.squish
          The current status of each input. Statuses show where an input
          stands in the participation process and are managed by
          administrators; they are only meaningful for publicly visible
          methods (ideation, proposals), even though survey responses carry a
          default status too. One row per input.
        DOC
      end

      def self.field_descriptions
        {
          'input_id' => 'The input. Joins to reporting_inputs.id.',
          'status_id' => 'The status. Group on it to count inputs per status.',
          'status_label' => 'Status name as configured by administrators, resolved to the platform primary locale.',
          'status_code' => <<~DOC.squish
            Locale-independent status category. For ideas: 'proposed', 'viewed',
            'under_consideration', 'accepted', 'implemented', 'rejected' or
            'custom'. For proposals also: 'threshold_reached', 'expired',
            'answered', 'ineligible'. Prefer this over status_label for
            filtering.
          DOC
        }
      end
    end
  end
end
