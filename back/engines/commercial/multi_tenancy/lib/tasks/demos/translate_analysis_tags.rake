# frozen_string_literal: true

# Regenerates the AI-generated topic tags (tag_type 'nlp_topic') of every analysis on a
# single tenant, in a given locale.
#
# Background: nlp_topic tag names are free text written by the topic-modeling LLM in
# whatever language it was instructed to use at generation time, and stored as a plain
# string (no multiloc). So they don't follow a platform locale switch - a demo cloned with
# English topics keeps showing English tags. This task re-runs topic modeling forcing the
# requested locale, so the tags come out in the right language.
#
# Intended for manual use on freshly cloned tenants used as demo platforms - NOT on live
# tenants. Topic modeling is non-deterministic, so regeneration produces *new* topics, not
# translations of the existing ones; the previous nlp_topic tags (and their input
# assignments) are deleted first. For that reason execute mode only runs on demo platforms
# (lifecycle_stage = 'demo') or in local development; a dry run is allowed everywhere.
#
# It re-runs real LLM calls (one topic-modeling call plus one classification call per
# input, per analysis), so it can be slow and incur API cost on tenants with many inputs.
#
# What it does:
#   - Targets one tenant, identified by the `host` argument.
#   - Requires the target `locale` to be one of the tenant's configured locales.
#   - For each analysis that currently has nlp_topic tags: deletes those tags (their
#     taggings cascade), then re-runs nlp_topic auto-tagging forcing the target locale,
#     reusing the filters of the analysis's most recent nlp_topic run (or all inputs).
#   - Regenerates the auto-insights heatmap for each touched analysis.
#   - Writes a JSON report (translate_analysis_tags.json) of the per-analysis changes.
#
# What it does NOT do:
#   - It does not touch other tag types (sentiment, language, controversial, platform_topic,
#     custom) - their names are fixed strings, codes, or already localized.
#   - It does not change anything in dry-run mode (the default).
#   - It does not run across multiple tenants - one `host` per invocation.
#
# Example commands (run from the repo root):
#   Dry run (no changes applied, just reports what would happen):
#     docker compose run --rm web bundle exec rake 'demos:translate_analysis_tags[example.com,nl-NL]'
#
#   Execute (applies the changes):
#     docker compose run --rm web bundle exec rake 'demos:translate_analysis_tags[example.com,nl-NL,execute]'

namespace :demos do
  desc 'Regenerate AI-generated (nlp_topic) analysis tags in a given locale'
  task :translate_analysis_tags, %i[host locale execute] => [:environment] do |_t, args|
    host = args[:host]
    locale = args[:locale]
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Translate analysis tags to '#{locale}' ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    if host.blank? || locale.blank?
      puts 'ERROR! Both host and locale arguments are required. Usage: rake demos:translate_analysis_tags[example.com,nl-NL,execute]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    # Regenerating tags deletes the existing ones, so applying changes is only allowed on
    # demo platforms (lifecycle_stage = 'demo') or in local development. A dry run stays
    # available everywhere.
    lifecycle_stage = tenant.switch { AppConfiguration.instance.settings('core', 'lifecycle_stage') }
    if execute && lifecycle_stage != 'demo' && !Rails.env.development?
      puts "ERROR! Execute mode is only allowed on demo platforms (lifecycle_stage = 'demo') or in development (current: '#{lifecycle_stage}'). Run without 'execute' to do a dry run."
      next
    end

    # The requested locale must be one the tenant is configured for - otherwise the tags
    # would be generated in a language the platform can't display.
    tenant_locales = tenant.switch { AppConfiguration.instance.settings('core', 'locales') }
    unless tenant_locales.include?(locale)
      puts "ERROR! Tenant '#{host}' does not have locale '#{locale}' configured (has: #{tenant_locales.join(', ')}). Aborting."
      next
    end

    reporter = ScriptReporter.new
    reporter.add_processed_tenant(tenant)

    total_analyses = 0
    total_tags_removed = 0
    total_tags_created = 0
    total_errors = 0

    tenant.switch do
      # Target the analyses that actually have AI-generated topic tags to regenerate.
      analyses = Analysis::Analysis
        .joins(:tags)
        .where(analysis_tags: { tag_type: Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE })
        .distinct

      if analyses.empty?
        puts 'No analyses with nlp_topic tags found - nothing to do.'
      end

      analyses.each do |analysis|
        total_analyses += 1
        existing_tags = analysis.tags.where(tag_type: Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE)
        old_tag_names = existing_tags.pluck(:name).sort
        context = { tenant: host, locale: locale, analysis: analysis.id }

        puts "\n=== Analysis #{analysis.id} (#{old_tag_names.size} nlp_topic tags) ==="

        unless execute
          total_tags_removed += old_tag_names.size
          puts "WOULD DELETE #{old_tag_names.size} nlp_topic tags: #{old_tag_names.join(', ')}"
          puts "WOULD REGENERATE nlp_topic tags in '#{locale}'."
          reporter.add_change(
            { nlp_topic_tags: old_tag_names },
            { nlp_topic_tags: "regenerated in '#{locale}'" },
            context: context
          )
          next
        end

        begin
          # Reuse the filters of the most recent nlp_topic run on this analysis, so the
          # regenerated tags cover the same set of inputs. Fall back to all inputs ({}).
          last_task = analysis.background_tasks
            .where(type: 'Analysis::AutoTaggingTask', auto_tagging_method: Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE)
            .order(created_at: :desc)
            .first
          filters = last_task&.filters || {}

          existing_tags.destroy_all # taggings cascade via Tag's dependent: :destroy
          total_tags_removed += old_tag_names.size
          puts "DELETED #{old_tag_names.size} nlp_topic tags: #{old_tag_names.join(', ')}"

          task = Analysis::AutoTaggingTask.create!(
            analysis: analysis,
            auto_tagging_method: Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE,
            filters: filters,
            state: 'queued'
          )
          atm = Analysis::AutoTaggingMethod::Base.for_auto_tagging_method(
            Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE, task
          )
          atm.specified_locale = locale
          atm.execute

          raise "auto-tagging task ended in state '#{task.reload.state}'" unless task.state == 'succeeded'

          new_tag_names = analysis.tags
            .where(tag_type: Analysis::AutoTaggingMethod::NLPTopic::TAG_TYPE)
            .pluck(:name).sort
          total_tags_created += new_tag_names.size
          puts "CREATED #{new_tag_names.size} nlp_topic tags: #{new_tag_names.join(', ')}"

          Analysis::HeatmapGenerationJob.perform_later(analysis)

          reporter.add_change(
            { nlp_topic_tags: old_tag_names },
            { nlp_topic_tags: new_tag_names },
            context: context
          )
        rescue StandardError => e
          total_errors += 1
          reporter.add_error(e.message, context: context)
          puts "  ERROR! Failed to regenerate tags for analysis #{analysis.id}: #{e.message}"
        end
      end
    end

    summary = {
      'Analyses processed' => total_analyses,
      (execute ? 'nlp_topic tags removed' : 'nlp_topic tags to be removed') => total_tags_removed
    }
    summary['nlp_topic tags created'] = total_tags_created if execute
    summary['Errors'] = total_errors if execute

    label_width = summary.keys.map(&:length).max
    puts "\nSummary for tenant #{host} (target locale '#{locale}'):"
    summary.each { |label, count| puts "  #{"#{label}:".ljust(label_width + 1)}  #{count}" }

    begin
      reporter.report!('translate_analysis_tags.json', verbose: false)
      puts "\nReport written to translate_analysis_tags.json"
    rescue StandardError => e
      puts "ERROR! Failed to write report: #{e.message}"
    end

    puts "\n---------- FINISHED TASK: Translate analysis tags to '#{locale}' ----------\n\n"
  end
end
