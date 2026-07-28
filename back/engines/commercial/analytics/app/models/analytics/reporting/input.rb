# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_inputs
#
#  id                   :uuid             primary key
#  title                :text
#  created_at           :datetime
#  submitted_at         :datetime
#  published_at         :datetime
#  user_id              :uuid
#  project_id           :uuid
#  creation_phase_id    :uuid
#  participation_method :string
#  status_id            :uuid
#  status_label         :text
#  status_code          :string
#  imported             :boolean
#  received_feedback    :boolean
#  likes_count          :integer
#  dislikes_count       :integer
#  comments_count       :integer
#  votes_count          :integer
#  offline_votes_count  :integer
#
module Analytics
  module Reporting
    class Input < Analytics::ApplicationRecordView
      self.table_name = 'reporting_inputs'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per input: the highest-level contribution, created by filling
          out and submitting a form. Depending on the participation method an
          input is an idea, a proposal, a common-ground statement or a survey
          response. Drafts are excluded.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'title' => 'Input title, resolved to the platform primary locale. NULL for survey responses, which have no title.',
          'created_at' => 'When the input was first created (UTC), possibly as a draft.',
          'submitted_at' => 'When the participant submitted the input (UTC). NULL for older records.',
          'published_at' => <<~DOC.squish,
            When the input became publicly visible (UTC). Can be later than
            submitted_at when administrators review inputs before publication,
            and NULL for inputs that are submitted but not (yet) published.
          DOC
          'user_id' => 'The registered author, or NULL for anonymous or deleted authors.',
          'project_id' => 'The project the input was posted in.',
          'creation_phase_id' => <<~DOC.squish,
            The phase the input was created in, for phase-specific methods like
            surveys. NULL for ideation and proposals inputs, which live across
            phases.
          DOC
          'participation_method' => <<~DOC.squish,
            The participation method the input was originally posted through
            (see reporting_phases.participation_method for values). Filter on
            this to separate ideas from survey responses.
          DOC
          'status_id' => <<~DOC.squish,
            Current status of the input, or NULL when it has none. Group on it
            to count inputs per status. Statuses are managed by administrators
            and only meaningful for publicly visible methods (ideation,
            proposals), even though survey responses carry a default status too.
          DOC
          'status_label' => 'Status name as configured by administrators, resolved to the platform primary locale.',
          'status_code' => <<~DOC.squish,
            Locale-independent status category. For ideas: 'proposed', 'viewed',
            'under_consideration', 'accepted', 'implemented', 'rejected' or
            'custom'. For proposals also: 'threshold_reached', 'expired',
            'answered', 'ineligible'. Prefer this over status_label for
            filtering.
          DOC
          'imported' => 'TRUE when the input was imported by an administrator (e.g. from paper forms) rather than posted online.',
          'received_feedback' => <<~DOC.squish,
            TRUE when an administrator gave official feedback on the input or
            changed its status. Only meaningful for publicly visible methods
            (ideation, proposals).
          DOC
          'likes_count' => 'Number of likes on the input.',
          'dislikes_count' => 'Number of dislikes on the input.',
          'comments_count' => 'Number of published comments on the input.',
          'votes_count' => 'Total online votes the input received in voting/budgeting phases.',
          'offline_votes_count' => 'Manually registered offline votes, entered by administrators. 0 when none.'
        }
      end

      def self.foreign_keys
        {
          'user_id' => 'reporting_users.id',
          'project_id' => 'reporting_projects.id',
          'creation_phase_id' => 'reporting_phases.id'
        }
      end
    end
  end
end
