# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_imports
#
#  id           :uuid             primary key
#  input_id     :uuid
#  source       :string
#  parser       :text
#  user_id      :uuid
#  user_created :boolean
#  locale       :string
#  approved_at  :datetime
#  created_at   :datetime
#
module Analytics
  module Reporting
    class InputImport < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_imports'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per imported input: an input an administrator brought in
          from a file (for example paper forms) instead of a participant
          posting it online. Imports only count once an administrator
          approved them. Use it to report how much participation came in
          offline, and through which import tool.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The imported input.',
          'source' => <<~DOC.squish,
            The kind of file: 'pdf' for scanned paper forms, read by FormSync
            (the platform's AI form reader), or 'xlsx' for spreadsheets. NULL
            when there was no file, such as ideas copied over from another
            platform.
          DOC
          'parser' => <<~DOC.squish,
            For 'pdf' imports, which reader extracted the answers (an AI model
            name, or 'google' / 'gpt' for older imports). NULL for spreadsheets,
            and for PDFs imported before the reader was recorded.
          DOC
          'user_id' => <<~DOC.squish,
            The staff member who ran the import, not the input's author (that is
            reporting_inputs.user_id). Can point to a user missing from
            reporting_users, so LEFT JOIN. NULL when unknown.
          DOC
          'user_created' => 'TRUE when the import created a new user account for the respondent.',
          'locale' => 'Language the imported file was read in, for example \'en\'.',
          'approved_at' => <<~DOC.squish,
            When an administrator approved the import (UTC). NULL for imports
            that skip approval, such as ideas copied over from another platform.
          DOC
          'created_at' => 'When the input was imported (UTC).'
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id', 'user_id' => 'reporting_users.id' }
      end
    end
  end
end
