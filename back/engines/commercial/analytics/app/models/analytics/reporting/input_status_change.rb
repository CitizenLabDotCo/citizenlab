# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_status_changes
#
#  id                :uuid             primary key
#  input_id          :uuid
#  from_status_id    :uuid
#  from_status_label :text
#  from_status_code  :string
#  to_status_id      :uuid
#  to_status_label   :text
#  to_status_code    :string
#  changed_at        :datetime
#
module Analytics
  module Reporting
    class InputStatusChange < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_status_changes'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per change of an input's status, by an administrator or
          automatically (for example a proposal reaching its vote threshold).
          Order by changed_at to follow an input's history, and combine with
          reporting_official_feedbacks to show how and how fast inputs got an
          answer. History only goes back as far as the platform's activity
          log, so an input without rows can still have a status other than
          the default (set before logging started, or when it was created,
          for example by an import).
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The input whose status changed.',
          'from_status_id' => <<~DOC.squish,
            The status before the change. NULL when that status was deleted
            since, or for older automatic proposal changes that only recorded
            the status code.
          DOC
          'from_status_label' => 'Name of the status before the change, resolved to the platform primary locale. NULL when from_status_id is NULL.',
          'from_status_code' => <<~DOC.squish,
            Locale-independent category of the status before the change (see
            reporting_inputs.status_code for values). NULL when that status was
            deleted since.
          DOC
          'to_status_id' => 'The status after the change. NULL in the same cases as from_status_id.',
          'to_status_label' => 'Name of the status after the change, resolved to the platform primary locale. NULL when to_status_id is NULL.',
          'to_status_code' => <<~DOC.squish,
            Locale-independent category of the status after the change (see
            reporting_inputs.status_code for values). NULL when that status was
            deleted since.
          DOC
          'changed_at' => 'When the status changed (UTC).'
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id' }
      end
    end
  end
end
