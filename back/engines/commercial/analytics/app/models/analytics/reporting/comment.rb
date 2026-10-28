# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_comments
#
#  id             :uuid             primary key
#  input_id       :uuid
#  parent_id      :uuid
#  user_id        :uuid
#  body           :text
#  likes_count    :integer
#  dislikes_count :integer
#  created_at     :datetime
#
module Analytics
  module Reporting
    class Comment < Analytics::ApplicationRecordView
      self.table_name = 'reporting_comments'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per published comment on an input, with its text. Deleted
          comments and staff-only internal comments are not included. Replies
          point to the comment they answer through parent_id; order by
          created_at to read a thread.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key. Matches reporting_contributions.id for the comment.',
          'input_id' => 'The input the comment was posted on.',
          'parent_id' => <<~DOC.squish,
            For a reply, the comment it answers; NULL for a top-level comment.
            The parent can be missing from this table when it was deleted, so
            LEFT JOIN on it.
          DOC
          'user_id' => 'The registered author, or NULL for anonymous or deleted authors.',
          'body' => <<~DOC.squish,
            The comment text, resolved to the platform primary locale. Stored as
            sanitized HTML: strip the tags before quoting it. Mentions of other
            users read '@mention', without their names. Written by residents and
            not otherwise screened for personal data: leave out names, contact
            details and addresses when quoting it.
          DOC
          'likes_count' => 'Number of likes on the comment.',
          'dislikes_count' => 'Number of dislikes on the comment.',
          'created_at' => 'When the comment was posted (UTC).'
        }
      end

      def self.foreign_keys
        {
          'input_id' => 'reporting_inputs.id',
          'parent_id' => 'reporting_comments.id',
          'user_id' => 'reporting_users.id'
        }
      end
    end
  end
end
