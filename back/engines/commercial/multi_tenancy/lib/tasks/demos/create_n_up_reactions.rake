# frozen_string_literal: true

# This rake task adds n 'up' reactions (likes) to a single Idea on a demo tenant,
# each reaction by a different regular, active user (user.active? == true and no
# roles).
#
# Before creating anything it checks that there are enough eligible users to give
# each reaction a distinct user, counting only users who are not already reacting
# to the idea (a user can hold at most one reaction per idea). If there aren't
# enough, it aborts without creating any reactions.
#
# Reactions are created in batches with a single multi-row INSERT per batch
# (activerecord-import), so it stays fast for large n. Because that bypasses the
# counter_culture callback that maintains Idea#likes_count, the task updates that
# counter itself afterwards, and then runs the automated status transition that a
# normal reaction save would (promoting a proposal to 'threshold_reached' once its
# reacting_threshold is met).
#
# Usage:
#   rake 'demos:create_n_up_reactions[hostname.com,<idea_id>,50]'
#
# Parameters:
#   - host: tenant hostname (e.g. localhost or demo.example.com)
#   - idea_id: UUID of the idea to add 'up' reactions to
#   - n_reactions: number of 'up' reactions to create
#
# Notes:
#   - Only works on demo platforms (lifecycle_stage = 'demo') or in local development.
#   - Needs to be run with rake (not rails) so the full Rails environment loads.

namespace :demos do
  desc "Add n 'up' reactions to an idea on a demo tenant, each by a different user"
  task :create_n_up_reactions, %i[host idea_id n_reactions] => [:environment] do |_t, args|
    batch_size = 1_000

    host = args[:host]
    idea_id = args[:idea_id]
    n_reactions = args[:n_reactions].to_i

    puts "---------- STARTING TASK: Add #{n_reactions} 'up' reactions to idea '#{idea_id}' on '#{host}' ----------\n\n"

    if host.blank? || idea_id.blank? || n_reactions.zero?
      puts 'ERROR! host, idea_id and n_reactions arguments are all required. Usage: rake demos:create_n_up_reactions[example.com,<idea_id>,50]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    lifecycle_stage = tenant.switch { AppConfiguration.instance.settings('core', 'lifecycle_stage') }
    if lifecycle_stage != 'demo' && !Rails.env.development?
      puts "ERROR! This task is only allowed on demo platforms (lifecycle_stage = 'demo') or in development (current: '#{lifecycle_stage}')."
      next
    end

    reporter = ScriptReporter.new
    reporter.add_processed_tenant(tenant)

    tenant.switch do
      idea = Idea.find_by(id: idea_id)
      if idea.nil?
        puts "ERROR! No idea found with id '#{idea_id}'. Aborting."
        next
      end

      # Eligible users: regular (no roles), active, and not already reacting to this
      # idea (a user can hold at most one reaction per idea). The `active` scope only
      # covers registered + not-blocked, so we apply `active?` in Ruby to also honour
      # the confirmation_required check.
      already_reacted_user_ids = idea.reactions.pluck(:user_id).compact
      eligible_users = User.active.normal_user.where.not(id: already_reacted_user_ids).select(&:active?)

      if eligible_users.size < n_reactions
        puts "ERROR! Not enough eligible users: need #{n_reactions} but only #{eligible_users.size} regular active users are available (excluding those already reacting to this idea). Aborting."
        next
      end

      now = Time.zone.now
      created = 0

      eligible_users.first(n_reactions).each_slice(batch_size) do |users_batch|
        puts "Creating reactions #{created + 1}..#{created + users_batch.size} of #{n_reactions}"

        reactions = users_batch.map do |user|
          Reaction.new(reactable: idea, user: user, mode: 'up', created_at: now, updated_at: now)
        end

        result = Reaction.import(reactions, validate: false)

        result.failed_instances.each do |reaction|
          reporter.add_error(reaction.errors.full_messages, context: { user_id: reaction.user_id })
        end

        created += users_batch.size - result.failed_instances.size
      end

      # counter_culture's after_create callback is skipped by bulk import, so set
      # Idea#likes_count from the actual rows once. This recomputes the true value
      # (correcting any drift) rather than blindly incrementing. Only likes_count
      # can change here since we only ever add 'up' reactions.
      idea.update_columns(likes_count: idea.likes.count) if created.positive?

      # The SideFxReactionService that normally runs on a reaction save is also
      # skipped, so trigger the automated status transition ourselves. For a
      # proposal this promotes 'proposed' -> 'threshold_reached' once likes_count
      # meets the phase's reacting_threshold; it's a no-op for other ideas.
      idea.reload
      InputStatusService.auto_transition_input!(idea)

      puts "\nDone. Added #{created} 'up' reactions to idea '#{idea_id}' on '#{host}'."
    end

    reporter.report!('create_n_up_reactions.json', verbose: false)
    puts "\n---------- TASK COMPLETE ----------"
  end
end
