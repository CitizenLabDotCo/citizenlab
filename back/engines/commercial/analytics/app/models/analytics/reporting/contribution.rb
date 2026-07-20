# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_contributions
#
#  id                   :uuid             primary key
#  type                 :text
#  parent_type          :text
#  parent_id            :uuid
#  contributed_at       :datetime
#  created_at           :datetime
#  participation_method :string
#  project_id           :uuid
#  phase_id             :uuid
#  user_id              :uuid
#  participant_id       :text
#
module Analytics
  module Reporting
    class Contribution < Analytics::ApplicationRecordView
      self.table_name = 'reporting_contributions'
      self.primary_key = :id
      # The `type` column is the contribution kind, not Rails STI.
      self.inheritance_column = nil

      def self.table_description
        <<~DOC.squish
          The unified participation fact: one row per action a resident took,
          across all participation methods. Count participants as
          COUNT(DISTINCT participant_id), optionally filtered by type, project,
          phase or date. Not covered: participation in embedded third-party
          surveys and document annotation.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Id of the underlying record (idea, comment, reaction, vote, ...). Unique within the view.',
          'type' => <<~DOC.squish,
            The kind of action: 'input' (posting an idea, proposal, common-ground
            statement or survey response), 'comment', 'reaction' (like/dislike),
            'vote' (one picked input in a submitted voting/budgeting basket),
            'volunteering' (signing up for a cause), 'poll_response', or
            'attendance' (registering for an event).
          DOC
          'parent_type' => <<~DOC.squish,
            What the action targets: 'input' for comments, votes and reactions
            on inputs; 'comment' for reactions on comments; NULL for standalone
            actions (inputs, volunteering, poll responses, attendances).
          DOC
          'parent_id' => 'Id of the parent input or comment.',
          'contributed_at' => 'When the resident performed the action (UTC). For inputs: submission, falling back to publication.',
          'created_at' => 'When the underlying record was first created (UTC); can predate contributed_at for drafts.',
          'participation_method' => <<~DOC.squish,
            For inputs: the method the input was collected through, matching
            reporting_inputs.participation_method. For other types: the method
            of the phase the action belongs to (see
            reporting_phases.participation_method for values). NULL for event
            attendances.
          DOC
          'project_id' => 'The project the action happened in. NULL only for platform-wide edge cases, or orphaned content.',
          'phase_id' => <<~DOC.squish,
            The phase the action belongs to. Structural where the source links
            to a phase; inferred from the action date for ideas without a
            creation phase, comments and reactions. NULL for event attendances
            and when no phase matches the date.
          DOC
          'user_id' => 'The registered author, or NULL for anonymous or deleted authors.',
          'participant_id' => <<~DOC.squish
            Stable identity of the author across contributions, to the best of
            our ability: the user id, or a stable per-user-per-project hash for
            anonymous ideas and comments, or the row id as last resort (such
            rows each count as one participant, which can overcount people).
            Use COUNT(DISTINCT participant_id) to count participants.
          DOC
        }
      end

      def self.foreign_keys
        {
          'project_id' => 'reporting_projects.id',
          'phase_id' => 'reporting_phases.id',
          'user_id' => 'reporting_users.id',
          'participant_id' => 'reporting_participants.id',
          'parent_id' => "reporting_inputs.id when parent_type = 'input', reporting_contributions.id when parent_type = 'comment'"
        }
      end
    end
  end
end
