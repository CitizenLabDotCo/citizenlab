# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_reactions
#
#  id         :uuid             primary key
#  input_id   :uuid
#  user_id    :uuid
#  reacted_at :datetime
#  mode       :string
#
module Analytics
  module Reporting
    class InputReaction < Analytics::ApplicationRecordView
      include ScopedView

      self.table_name = 'reporting_input_reactions'
      self.primary_key = :id

      def self.for_projects(project_ids) = where(input_id: Input.for_projects(project_ids).select(:id))

      def self.table_description
        <<~DOC.squish
          One row per reaction (like or dislike) on an input. Authors like
          their own input by default when posting it. Reactions on comments are
          not included here; they only appear in reporting_contributions.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The input reacted to.',
          'user_id' => 'The reacting user, or NULL for anonymous or deleted users.',
          'reacted_at' => 'When the reaction was placed (UTC).',
          'mode' => "'up' for a like, 'down' for a dislike."
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id', 'user_id' => 'reporting_users.id' }
      end
    end
  end
end
