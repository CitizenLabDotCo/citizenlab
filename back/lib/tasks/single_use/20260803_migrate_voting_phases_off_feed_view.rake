# frozen_string_literal: true

# Moves voting phases off the feed view (called "Perspectives" in the UI), back to cards.
#
# A phase offers a set of views (`available_views`) and opens on one of them (`presentation_mode`).
# The feed view was offered on every method that shows inputs publicly, with no per-method
# restriction — not because it suited them all, but to keep the admin interface consistent.
#
# It does not suit voting. The feed surfaces neither the vote count of an input nor the controls to
# cast a vote, so a voting phase opening on it hides the only thing it asks participants to do. The
# phase form has in fact never offered the toggle for this method — but the model accepted it, so
# the REST API, the MCP tools and phases predating the form's rule could all still set it.
#
# This is the same withdrawal already applied to proposals in
# `20260721_migrate_proposals_phases_off_feed_view.rake`, and the feed now belongs to ideation
# alone. This task migrates the voting phases still holding it:
#
#     presentation_mode: 'feed', available_views: ['card', 'feed']  ->  'card', ['card']
#     presentation_mode: 'card', available_views: ['card', 'feed']  ->  'card', ['card']
#     presentation_mode: 'map',  available_views: ['card', 'map']   ->  untouched, no feed
#
# `presentation_mode` is only rewritten when it is 'feed' itself: a phase that merely offered the
# feed alongside cards keeps opening on whichever view the admin chose. Both 'card' and the
# retained mode are unioned back into the views, because the model requires each of them
# independently, so a phase that had drifted out of that state would otherwise be written back
# still invalid, and reported as migrated. The writes bypass validation, so this is the only thing
# standing between drifted data and a silently invalid row.
#
# The migration is a subtraction, so re-running the task is a no-op.
#
# Unlike its proposals predecessor, this ships alongside the code that rejects the view rather than
# ahead of it: the admin UI cannot produce this state, so there is no window in which a fresh bad
# row could appear between the two. It still names the method and the view literally rather than
# reading `pmethod.allowed_presentation_modes` — a one-off repair of a known state, which should
# keep describing that state even if the rule later moves.
#
# `TenantScript` owns the dry run, the tenant loop and the report; what is left here is the
# migration itself and the summary, which prints every affected phase with its project and whether
# it is finished, active or still to come, so the scale of the change is visible at a glance and an
# individual phase can be traced back to its project if anyone asks about it. The report carries the
# same rows, with full multilocs.
#
# Analyses without writing unless passed 'execute'; a host limits the run to one tenant:
#
#     rake single_use:migrate_voting_phases_off_feed_view                     # dry run, all tenants
#     rake 'single_use:migrate_voting_phases_off_feed_view[execute]'          # migrate all tenants
#     rake 'single_use:migrate_voting_phases_off_feed_view[execute,foo.com]'  # migrate one tenant
namespace :single_use do
  desc "Move voting phases off the feed view, back to cards. Dry run unless passed 'execute'."
  task :migrate_voting_phases_off_feed_view, %i[execute host] => [:environment] do |_t, args|
    # The report carries the full multilocs; these are the rows a human needs on screen.
    affected = []

    # TimelineService classifies a whole project, not a phase, so this composes the phase's own two
    # predicates. `started?` reads `start_at` without a nil check, hence the guard: it is nullable.
    phase_timing = lambda do |phase|
      next 'unscheduled' if phase.start_at.nil?
      next 'future' unless phase.started?

      phase.complete? ? 'finished' : 'active'
    end

    summary = lambda do |_script|
      by_host = affected.group_by { |row| row[:host] }
      next if by_host.empty?

      puts "\n   👥 Tenants with migrated phases:"
      by_host.each do |affected_host, rows|
        puts "\n      #{affected_host}"
        rows.each do |row|
          puts "         phase   #{row[:phase_id]}  #{row[:phase_title]} (#{row[:timing]})"
          puts "         project #{row[:project_id]}  #{row[:project_title]}"
        end
      end
    end

    TenantScript.run(
      'migrate_voting_phases_off_feed_view',
      args: args,
      description: 'moving voting phases off the feed view, back to cards',
      # Deliberately not the default scope: it skips tenants whose creation never finalized, and
      # those are on their way to being live, so their phases have to satisfy the new rule too.
      # Deleted tenants are still skipped: nothing un-deletes one, no request or job switches into
      # one, and its schema is being dropped, so no phase of theirs is ever saved against the rule.
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      phases = Phase
        .where(participation_method: 'voting')
        .where("presentation_mode = 'feed' OR 'feed' = ANY(available_views)")

      multiloc_service = MultilocService.new

      phases.each do |phase|
        new_mode = phase.presentation_mode == 'feed' ? 'card' : phase.presentation_mode
        new_views = ((phase.available_views || []) - ['feed']) | ['card'] | [new_mode]

        script.reporter.add_change(
          { presentation_mode: phase.presentation_mode, available_views: phase.available_views },
          { presentation_mode: new_mode, available_views: new_views },
          context: {
            tenant: tenant.host,
            phase_id: phase.id,
            phase_title: phase.title_multiloc,
            phase_timing: phase_timing.call(phase),
            project_id: phase.project_id,
            project_title: phase.project.title_multiloc,
            project_slug: phase.project.slug
          }
        )

        affected << {
          host: tenant.host,
          timing: phase_timing.call(phase),
          phase_id: phase.id,
          phase_title: multiloc_service.t(phase.title_multiloc),
          project_id: phase.project_id,
          project_title: multiloc_service.t(phase.project.title_multiloc)
        }

        # `update_columns` because we migrate *to* a valid state. `update!` would re-run every
        # other validation on a phase we have not audited, and could fail for a second reason.
        phase.update_columns(presentation_mode: new_mode, available_views: new_views) if script.execute?
      end
    end
  end
end
