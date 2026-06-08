# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_participations
#
#  id(Identifier of the underlying source record (idea, comment, reaction, poll response, volunteer, basket or event attendance). Unique per row.)                                                                                                                                                                                                                                                                                  :uuid             primary key
#  dimension_user_id(Acting user; foreign key to analytics_dimension_users.id. NULL for anonymous actions. Do not count participants on this column (anonymous rows would be dropped); use participant_id.)                                                                                                                                                                                                                         :uuid
#  participant_id(Stable per-participant key for distinct counts. Equals the user id when known. For anonymous ideas, native-survey responses and comments it falls back to a stable author hash, so repeat actions de-duplicate. For anonymous reactions, poll responses, baskets and volunteering it falls back to the row id, so each such action counts as a separate participant. Event attendances use the attendee id only.) :text
#  dimension_project_id(Project the action belongs to; foreign key to analytics_dimension_projects.id. Can be NULL when the action is not linked to a project.)                                                                                                                                                                                                                                                                     :uuid
#  dimension_type_id(Participation type; foreign key to analytics_dimension_types.id. In this fact the type is one of idea, survey, comment, reaction, poll, volunteer, basket or event_attendance.)                                                                                                                                                                                                                                :uuid
#  dimension_date_created_id(Creation date (created_at truncated to a date); foreign key to analytics_dimension_dates.date. Date only, in UTC, so it can differ from the tenant-local date near midnight.)                                                                                                                                                                                                                          :date
#  reactions_count(Reactions associated with the row. For idea and comment rows: likes plus dislikes received by that item. For reaction rows: always 1 (the reaction itself). 0 for polls, volunteering, baskets and event attendances.)                                                                                                                                                                                           :integer
#  likes_count(Likes (up-votes). For idea and comment rows: likes received by the item. For reaction rows: 1 when the reaction is a like, else 0. 0 for the other types.)                                                                                                                                                                                                                                                           :integer
#  dislikes_count(Dislikes (down-votes). For idea and comment rows: dislikes received by the item. For reaction rows: 1 when the reaction is a dislike, else 0. 0 for the other types.)                                                                                                                                                                                                                                             :integer
#
module Analytics
  class FactParticipation < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser'
    belongs_to :dimension_type, class_name: 'Analytics::DimensionType'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject', optional: true
  end
end
