# frozen_string_literal: true

# Moves proposals phases off the feed view (called "Perspectives" in the UI), back to cards.
#
# A phase offers a set of views (`available_views`) and opens on one of them (`presentation_mode`).
# The feed view was offered on every method that shows inputs publicly, with no per-method
# restriction — not because it suited them all, but to keep the admin interface consistent.
#
# It does not suit proposals. A proposal has to gather likes to reach its `reacting_threshold`, and
# the feed surfaces neither the like count nor the progress towards that threshold, so participants
# don't realise their proposal needs votes at all. At least one client configured a proposals phase
# this way before we noticed.
#
# So the option is being withdrawn for this method, and this task migrates the phases already using
# it:
#
#     presentation_mode: 'feed', available_views: ['card', 'feed']  ->  'card', ['card']
#     presentation_mode: 'card', available_views: ['card', 'feed']  ->  'card', ['card']
#     presentation_mode: 'map',  available_views: ['card', 'map']   ->  untouched, no feed
#
# `presentation_mode` is only rewritten when it is 'feed' itself: a phase that merely offered the
# feed alongside cards keeps opening on whichever view the admin chose. 'card' is unioned back in
# because the model requires it independently, so a phase that had somehow lost it would otherwise
# be written back still invalid, and reported as migrated.
#
# The migration is a subtraction, so re-running the task is a no-op.
#
# This ships and runs ahead of the code that hides the option and rejects it in the API, so that
# the stricter rule only ever meets data that already satisfies it. It therefore cannot lean on
# anything from that work: the method and the view are named literally here, because this is a
# one-off repair of a known state rather than an expression of the rule.
#
# Every affected phase is printed with its project and whether it is finished, active or still to
# come, so the scale of the change is visible at a glance and an individual phase can be traced back
# to its project if anyone asks about it. The report carries the same rows, with full multilocs.
#
# Analyses without writing unless passed 'execute'; a host limits the run to one tenant:
#
#     rake single_use:migrate_proposals_phases_off_feed_view                     # dry run, all tenants
#     rake 'single_use:migrate_proposals_phases_off_feed_view[execute]'          # migrate all tenants
#     rake 'single_use:migrate_proposals_phases_off_feed_view[execute,foo.com]'  # migrate one tenant
namespace :single_use do
  desc "Move proposals phases off the feed view, back to cards. Dry run unless passed 'execute'."
  task :migrate_proposals_phases_off_feed_view, %i[execute host] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    host = args[:host]

    reporter = ScriptReporter.new
    totals = Hash.new(0)
    affected = []

    # There is no single past/active/future helper, so this composes the two that exist. Both read
    # `start_at` without a nil check, hence the guard: it is nullable on an unscheduled phase.
    now = Time.zone.now
    timeline_service = TimelineService.new
    phase_timing = lambda do |phase|
      next 'unscheduled' if phase.start_at.nil?
      next 'active' if timeline_service.phase_current?(phase, now)

      phase.started? ? 'finished' : 'future'
    end

    if execute
      puts '🚀 MIGRATION MODE: moving proposals phases off the feed view.'
      puts '⚠️  THIS WILL MODIFY THE DATABASE'
    else
      puts '🔍 DRY RUN MODE: analysing without writing.'
      puts '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    end
    puts '=' * 80

    # Deliberately not `Tenant.creation_finalized` or `safe_switch_each`: both skip deleted tenants,
    # and a tenant stuck mid-deletion still holds phases that the new rule would reject.
    tenants = host ? Tenant.where(host: host) : Tenant.all

    tenants.each do |tenant|
      next unless ActiveRecord::Base.connection.schema_exists?(tenant.schema_name)

      reporter.add_processed_tenant(tenant)

      tenant.switch do
        # Apartment migrates `Tenant.not_deleted` only, so a tenant deleted before the
        # 20260223103753 migration never received the column, and cannot offer the feed view.
        unless ActiveRecord::Base.connection.column_exists?(:phases, :available_views)
          totals[:skipped_no_column] += 1
          next
        end

        phases = Phase
          .where(participation_method: 'proposals')
          .where("presentation_mode = 'feed' OR 'feed' = ANY(available_views)")

        multiloc_service = MultilocService.new

        phases.each do |phase|
          new_views = ((phase.available_views || []) - ['feed']) | ['card']
          new_mode = phase.presentation_mode == 'feed' ? 'card' : phase.presentation_mode

          reporter.add_change(
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

          # The report carries the full multilocs; this is only what a human needs on screen.
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
          phase.update_columns(presentation_mode: new_mode, available_views: new_views) if execute
          totals[:migrated] += 1
        end
      end
    rescue StandardError => e
      # One unreachable tenant must not abort the run.
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
    end

    puts "\n#{'=' * 80}"
    puts(execute ? '📊 MIGRATION SUMMARY:' : '📊 DRY RUN SUMMARY:')
    by_host = affected.group_by { |row| row[:host] }
    puts "   #{execute ? 'Migrated' : 'Would migrate'}: #{totals[:migrated]} phase(s) across #{by_host.size} tenant(s)"
    puts "   Skipped (schema predates the available_views column): #{totals[:skipped_no_column]}"
    puts "   Errors: #{reporter.errors.size}"

    if by_host.any?
      puts "\n   👥 Tenants with migrated phases:"
      by_host.each do |affected_host, rows|
        puts "\n      #{affected_host}"
        rows.each do |row|
          puts "         phase   #{row[:phase_id]}  #{row[:phase_title]} (#{row[:timing]})"
          puts "         project #{row[:project_id]}  #{row[:project_title]}"
        end
      end
    end

    report_file = execute ? 'migrate_proposals_phases_off_feed_view.json' : 'migrate_proposals_phases_off_feed_view_dry_run.json'
    reporter.report!(report_file)
    puts "\n   📝 Per-phase report: #{report_file}"
  end
end
