# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id                        :uuid             primary key
#  dimension_user_id         :uuid
#  participant_id            :text
#  dimension_project_id      :uuid
#  dimension_type_id         :uuid
#  dimension_date_created_id :date
#  reactions_count           :integer
#  likes_count               :integer
#  dislikes_count            :integer
#
module Analytics
  class FactParticipation < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser'
    belongs_to :dimension_type, class_name: 'Analytics::DimensionType'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true

    def self.table_description
      <<~DOC.squish
        Fact table with one row per participation action: a published idea or native-survey
        response, a comment, a reaction (like/dislike), a poll response, a volunteering sign-up,
        a basket (participatory-budgeting submission) or an event attendance. Count distinct
        participants with participant_id (it handles anonymous actions), not dimension_user_id.
        Join the dimension_* keys to the matching analytics_dimension_* tables.
      DOC
    end

    def self.field_descriptions
      {
        'id' => <<~DOC.squish,
          Identifier of the underlying source record (idea, comment, reaction, poll response,
          volunteer, basket or event attendance). Unique per row.
        DOC
        'dimension_user_id' => <<~DOC.squish,
          Acting user; foreign key to analytics_dimension_users.id. NULL for anonymous actions.
          Do not count participants on this column (anonymous rows would be dropped); use participant_id.
        DOC
        'participant_id' => <<~DOC.squish,
          Stable per-participant key for distinct counts. Equals the user id when known. For
          anonymous ideas, native-survey responses and comments it falls back to a stable author
          hash, so repeat actions de-duplicate. For anonymous reactions, poll responses, baskets
          and volunteering it falls back to the row id, so each such action counts as a separate
          participant. Event attendances use the attendee id only.
        DOC
        'dimension_project_id' => <<~DOC.squish,
          Project the action belongs to; foreign key to analytics_dimension_projects.id. Can be
          NULL when the action is not linked to a project.
        DOC
        'dimension_type_id' => <<~DOC.squish,
          Participation type; foreign key to analytics_dimension_types.id. In this fact the type
          is one of idea, survey, comment, reaction, poll, volunteer, basket or event_attendance.
        DOC
        'dimension_date_created_id' => <<~DOC.squish,
          Creation date (created_at truncated to a date); foreign key to analytics_dimension_dates.date.
          Date only, in UTC, so it can differ from the tenant-local date near midnight.
        DOC
        'reactions_count' => <<~DOC.squish,
          Reactions associated with the row. For idea and comment rows: likes plus dislikes received
          by that item. For reaction rows: always 1 (the reaction itself). 0 for polls, volunteering,
          baskets and event attendances.
        DOC
        'likes_count' => <<~DOC.squish,
          Likes (up-votes). For idea and comment rows: likes received by the item. For reaction rows:
          1 when the reaction is a like, else 0. 0 for the other types.
        DOC
        'dislikes_count' => <<~DOC.squish
          Dislikes (down-votes). For idea and comment rows: dislikes received by the item. For
          reaction rows: 1 when the reaction is a dislike, else 0. 0 for the other types.
        DOC
      }
    end
  end
end
