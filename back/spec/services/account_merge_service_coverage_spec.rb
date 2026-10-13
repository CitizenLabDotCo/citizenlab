# frozen_string_literal: true

require 'rails_helper'

# Guards AccountMergeService against user references it was never taught about. The
# merge deletes the source account, and deleting a user nullifies or destroys most
# rows pointing at it without raising, so a missed reference is silent data loss.
#
# Every column that references users, found through foreign keys and belongs_to
# associations, must be moved by AccountMergeService::MOVES or be listed in
# `not_moved` with the reason. Polymorphic references (an activity's item, say) name
# no table, so they cannot be found this way and are not checked.
describe 'AccountMergeService coverage' do # rubocop:disable RSpec/DescribeClass
  # "table.column" => why the merge leaves it on the source.
  let(:not_moved) do
    admin_reason = 'admin or moderator work, and eligibility refuses a source with roles'

    {
      'admin_publications.scheduled_by_id' => admin_reason,
      'email_bans.banned_by_id' => admin_reason,
      'email_campaigns_campaigns.author_id' => admin_reason,
      'idea_imports.import_user_id' => admin_reason,
      'ideas.assignee_id' => admin_reason,
      'ideas.manual_votes_last_updated_by_id' => admin_reason,
      'internal_comments.author_id' => admin_reason,
      'invites.inviter_id' => admin_reason,
      'invites_imports.importer_id' => admin_reason,
      'jobs_trackers.owner_id' => admin_reason,
      'official_feedbacks.user_id' => admin_reason,
      'phases.manual_voters_last_updated_by_id' => admin_reason,
      'project_imports.import_user_id' => admin_reason,
      'project_reviews.requester_id' => admin_reason,
      'project_reviews.reviewer_id' => admin_reason,
      'projects.default_assignee_id' => admin_reason,
      'report_builder_reports.owner_id' => admin_reason,

      'confirmations.user_id' => "codes proving the source's own addresses, deleted with it",
      'invites.invitee_id' => 'the invite that created the source; eligibility refuses a pending one',
      'notifications.recipient_id' => 'addressed to the source; the target keeps its own',
      'notifications.initiating_user_id' => 'only names who triggered a notification sent to someone else',
      'email_campaigns_deliveries.user_id' => 'history of emails sent to the source',
      'email_campaigns_campaign_email_commands.recipient_id' => 'history of email commands for the source',
      'email_campaigns_examples.recipient_id' => 'sample emails kept for campaign previews',
      'email_campaigns_unsubscription_tokens.user_id' => 'one per account; the target has its own',
      'sms_deliveries.user_id' => 'history of texts sent to the source',
      # Moving these would let an app act as the target without anyone approving it there.
      'oauth_access_grants.resource_owner_id' => 'authorises an app to act as the source',
      'oauth_access_tokens.resource_owner_id' => 'authorises an app to act as the source'
    }.freeze
  end

  def user_references
    Rails.application.eager_load!
    connection = ActiveRecord::Base.connection
    tables = connection.tables.to_set

    from_foreign_keys = tables.flat_map do |table|
      connection.foreign_keys(table)
        .select { |foreign_key| foreign_key.to_table == 'users' }
        .map { |foreign_key| "#{table}.#{foreign_key.column}" }
    end

    # Some tables reference users without a foreign key (surveys_responses), so the
    # associations are read too. Views are skipped: they hold no rows of their own.
    from_associations = ActiveRecord::Base.descendants
      .reject(&:abstract_class?)
      .select { |model| model.name && tables.include?(model.table_name) }
      .flat_map do |model|
        model.reflect_on_all_associations(:belongs_to)
          .reject(&:polymorphic?)
          .select { |reflection| reflection.class_name.delete_prefix('::') == 'User' }
          .map { |reflection| "#{model.table_name}.#{reflection.foreign_key}" }
      end

    (from_foreign_keys + from_associations).uniq.sort
  end

  def moved_references
    AccountMergeService::MOVES.filter_map do |move|
      model = move[:model].safe_constantize
      "#{model.table_name}.#{move[:fk]}" if model
    end
  end

  def bullet_list(items)
    items.map { |item| " - #{item}" }.join("\n")
  end

  it 'moves every user reference, or says why not' do
    uncovered = user_references - moved_references - not_moved.keys

    expect(uncovered).to(
      be_empty,
      "These columns reference users but are neither in AccountMergeService::MOVES nor in `not_moved` in this spec:\n#{bullet_list(uncovered)}"
    )
  end

  it 'has no stale or redundant entries in `not_moved`' do
    references = user_references
    moved = moved_references

    problems = not_moved.keys.filter_map do |reference|
      if references.exclude?(reference)
        "#{reference}: does not reference users (remove it)"
      elsif moved.include?(reference)
        "#{reference}: already moved by AccountMergeService::MOVES (remove it)"
      end
    end

    expect(problems).to(be_empty, "Stale or redundant `not_moved` entries:\n#{bullet_list(problems)}")
  end

  # The service skips a model it cannot load, so a typo in MOVES would move nothing
  # and raise nothing.
  it 'names a real model and column in every MOVES entry' do
    Rails.application.eager_load!

    problems = AccountMergeService::MOVES.filter_map do |move|
      model = move[:model].safe_constantize
      if !(model.is_a?(Class) && model < ActiveRecord::Base)
        "#{move[:model]}: not an ActiveRecord model"
      elsif model.column_names.exclude?(move[:fk].to_s)
        "#{move[:model]}: has no #{move[:fk]} column"
      end
    end

    expect(problems).to(be_empty, "Broken AccountMergeService::MOVES entries:\n#{bullet_list(problems)}")
  end
end
