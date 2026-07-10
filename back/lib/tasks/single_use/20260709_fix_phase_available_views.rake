# frozen_string_literal: true

# Repairs phases whose `available_views` does not contain their `presentation_mode`.
#
# A phase offers a set of views (`available_views`) and opens on one of them
# (`presentation_mode`). `Phase#validate_available_views` therefore requires that
# `available_views` include `presentation_mode`, and that it always include 'card'.
#
# The 20260223103753 migration rebuilt `available_views` from scratch:
#
#     views = ['card']
#     views << 'map'  if location_description_enabled?(phase)  # ideation and proposals only
#     views << 'feed' if phase.presentation_mode == 'feed'
#
# `location_description_enabled?` returns false for every other participation method, so a voting
# phase set to open on the map was left offering only the card view:
#
#     presentation_mode: 'map', available_views: ['card']  # opens on a view it does not offer
#
# The migration wrote with `update_column`, which skips validation, so the row persisted. Every
# later `update!` on such a phase re-runs the validation and raises `RecordInvalid`, whatever the
# write was about: an admin editing the phase, `Phase#update_manual_votes_count!`, or
# `Basket#update_basket_and_vote_counts` — and that last one runs inside `DeleteUserJob`, so the
# bad row stalls user and tenant deletion.
#
# This task adds the missing view back. `presentation_mode` is read, never written: the mode is
# the admin's choice and was always correct; it is `available_views` the migration got wrong.
#
#     presentation_mode: 'map',  ['card']          ->  ['card', 'map']
#     presentation_mode: 'map',  ['card', 'feed']  ->  ['card', 'feed', 'map']
#     presentation_mode: 'card', ['card']          ->  untouched, not drifted
#
# The repair is a set union, so no view is ever removed and re-running the task is a no-op.
#
# One invalid shape is out of reach: a phase omitting 'card' while containing its own
# `presentation_mode` (say `'map'` with `['map']`) fails a different validation, is not selected
# below, and unioning would not fix it. The migration cannot produce it. The summary counts any
# such rows so that a run tells us whether the case is real.
#
# DRY_RUN=true analyses without writing; HOST=<host> limits the run to one tenant.
namespace :single_use do
  desc "Add each phase's presentation_mode to its available_views, where the backfill omitted it. DRY_RUN=true to analyse only."
  task fix_phase_available_views: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'
    host = ENV.fetch('HOST', nil)

    reporter = ScriptReporter.new
    totals = Hash.new(0)

    if dry_run
      puts '🔍 DRY RUN MODE: analysing without writing.'
      puts '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    else
      puts '🚀 REPAIR MODE: adding the default presentation mode to available_views.'
      puts '⚠️  THIS WILL MODIFY THE DATABASE'
    end
    puts '=' * 80

    # Deliberately not `Tenant.creation_finalized` or `safe_switch_each`: both skip deleted
    # tenants, and tenants stuck mid-deletion are among the ones that need repairing.
    tenants = host ? Tenant.where(host: host) : Tenant.all

    tenants.each do |tenant|
      next unless ActiveRecord::Base.connection.schema_exists?(tenant.schema_name)

      reporter.add_processed_tenant(tenant)

      tenant.switch do
        # Apartment migrates `Tenant.not_deleted` only, so a tenant deleted before the
        # 20260223103753 migration never received the column, and cannot be drifted.
        unless ActiveRecord::Base.connection.column_exists?(:phases, :available_views)
          totals[:skipped_no_column] += 1
          next
        end

        drifted = Phase
          .where.not(presentation_mode: nil)
          .where.not('presentation_mode = ANY(available_views)')

        # Invalid for a reason this task cannot repair: `available_views` omits 'card' but does
        # contain `presentation_mode`, so `drifted` does not select it and a union changes nothing.
        totals[:missing_card] += Phase
          .where.not("'card' = ANY(available_views)")
          .where('presentation_mode IS NULL OR presentation_mode = ANY(available_views)')
          .count

        drifted.each do |phase|
          # Adding an unknown mode would only trade this failure for 'contains invalid view modes'.
          if Phase::PRESENTATION_MODES.exclude?(phase.presentation_mode)
            reporter.add_error(
              "presentation_mode #{phase.presentation_mode.inspect} is not a known presentation mode",
              context: { tenant: tenant.host, phase_id: phase.id }
            )
            totals[:skipped] += 1
            next
          end

          # 'card' is unioned in too: the model requires it independently, so a drifted phase that
          # also lacked it would otherwise be written back still invalid, and reported as fixed.
          new_views = phase.available_views | ['card'] | [phase.presentation_mode]

          reporter.add_change(
            phase.available_views, new_views,
            context: {
              tenant: tenant.host,
              phase_id: phase.id,
              project_id: phase.project_id,
              participation_method: phase.participation_method,
              presentation_mode: phase.presentation_mode
            }
          )

          # `update_column` because we repair *to* a valid state. `update!` would re-run every
          # other validation on a phase we have not audited, and could fail for a second reason.
          phase.update_column(:available_views, new_views) unless dry_run
          totals[:fixed] += 1
        end
      end
    rescue StandardError => e
      # One unreachable tenant must not abort the run.
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
    end

    puts "\n#{'=' * 80}"
    puts(dry_run ? '📊 DRY RUN SUMMARY:' : '📊 REPAIR SUMMARY:')
    puts "   #{dry_run ? 'Would fix' : 'Fixed'}: #{totals[:fixed]} phase(s)"
    puts "   Skipped (unknown presentation_mode): #{totals[:skipped]}"
    puts "   Skipped (schema predates the available_views migration): #{totals[:skipped_no_column]}"
    puts "   Not repairable (available_views omits 'card'): #{totals[:missing_card]} phase(s)"
    puts "   Errors: #{reporter.errors.size}"

    report_file = dry_run ? 'fix_phase_available_views_dry_run.json' : 'fix_phase_available_views.json'
    reporter.report!(report_file)
    puts "   📝 Per-phase report: #{report_file}"
  end
end
