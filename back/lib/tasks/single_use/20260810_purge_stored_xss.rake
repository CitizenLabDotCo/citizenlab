# frozen_string_literal: true

# Re-sanitises stored content carrying an XSS payload saved before sanitisation was added. Draft
# idea bodies were never sanitised; titles and machine translations were never HTML-sanitised at
# all. Sanitising on write does not touch rows already in the database, so this cleans the stored
# values in place, using each field's whole write-path pipeline:
#
#     Idea#body_multiloc              -> SanitizationService#sanitize_body_multiloc, Idea features
#     Comment#body_multiloc           -> SanitizationService#sanitize_body_multiloc, Comment features
#     MachineTranslation#translation  -> the source field's own pipeline, whichever that is
#     #title_multiloc, on each of `title_models`
#                                     -> SanitizationService#strip_multiloc_to_plain_text
#
# `custom_field_values` is intentionally out of scope: those answers render as escaped text on the
# front end (not an HTML sink), so they cannot execute and do not need purging.
#
# A row is written only when processing actually changes it, so clean content is left untouched
# and re-runs are no-ops. Writes use `update_columns` to avoid re-running unrelated validations on
# legacy rows.
#
# `TenantScript` owns the dry run, the tenant loop and the report. Deleted tenants stay out; every
# other tenant can still serve content, so all of them are in scope.
#
#     rake single_use:purge_stored_xss                     # dry run, all tenants
#     rake 'single_use:purge_stored_xss[execute]'          # write, all tenants
#     rake 'single_use:purge_stored_xss[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Re-sanitise stored title/body/translation content carrying XSS payloads. Dry run unless passed 'execute'."
  task :purge_stored_xss, %i[execute host] => [:environment] do |_t, args|
    service = SanitizationService.new

    # Pre-filter over a text-typed SQL expression (a jsonb cast or a text column). No `<` means no
    # tag to strip and no `&` means no entity to decode, so nothing this excludes can carry a
    # payload. It does exclude rows the write path would merely normalise (a bare URL to linkify, a
    # stray `>` to re-escape) - deliberate: this task removes payloads, it does not reformat clean
    # history. Keep it this wide: keyword matching would miss `<iframe src>`, `<form>`, `<object>`,
    # `<style>` and schemes hidden behind an entity like `javas&#99;ript:`.
    rewritable = ->(col) { "(#{col} LIKE '%<%' OR #{col} LIKE '%&%')" }

    strip_multiloc = service.method(:strip_multiloc_to_plain_text)

    # Models that strip their `title_multiloc` on write, minus `CustomField` and
    # `EmailCampaigns::Campaign` - those two are swept by `purge_stored_xss_form_and_email_text`,
    # which is run separately so their higher risk of losing a legitimate `<` can be reviewed on its
    # own.
    title_models = [
      Idea, Project, Phase, ProjectFolders::Folder, InputTopic, GlobalTopic, DefaultInputTopic, Event, StaticPage,
      Space, Area, Group, IdeaStatus, NavBarItem, CustomFieldOption, CustomFieldMatrixStatement,
      Polls::Question, Polls::Option, CustomMaps::Layer, Volunteering::Cause
    ].freeze

    affected = [] # rows for the summary: { host:, model:, attribute: }

    # Re-sanitises one attribute across a scope, reporting and writing only real changes.
    purge = lambda do |tenant, script, scope, attribute, sanitizer, model_label|
      scope.find_each do |record|
        # The raw column, not the reader: a model may override one to merge in a default or a
        # translation, and writing that back would save a computed value as if it had been typed.
        old_value = record[attribute]
        new_value = sanitizer.call(old_value)
        next if new_value == old_value

        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
        )
        affected << { host: tenant.host, model: model_label, attribute: attribute.to_s }
        record.update_columns(attribute => new_value) if script.execute?
      rescue StandardError => e
        # `TenantScript` only rescues per tenant, so without this one bad row would cost the tenant
        # every sweep still to come.
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: model_label, id: record.id, attribute: attribute.to_s }
        )
      end
    end

    summary = lambda do |_script|
      next if affected.empty?

      puts "\n   🧹 Purged rows by tenant:"
      affected.group_by { |row| row[:host] }.each do |host, rows|
        puts "\n      #{host}"
        rows.group_by { |row| [row[:model], row[:attribute]] }.each do |(model, attribute), group|
          puts "         #{model}##{attribute}: #{group.size}"
        end
      end
    end

    TenantScript.run(
      'purge_stored_xss',
      args: args,
      description: 'purging stored XSS payloads from idea, comment, title and translation content',
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      purge.call(
        tenant, script,
        Idea.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value) { service.sanitize_body_multiloc(value, Idea::BODY_SANITIZE_FEATURES) }, 'Idea'
      )
      title_models.each do |model|
        purge.call(
          tenant, script,
          model.where(rewritable.call('title_multiloc::text')), :title_multiloc,
          strip_multiloc, model.name
        )
      end
      purge.call(
        tenant, script,
        Comment.where(rewritable.call('body_multiloc::text')), :body_multiloc,
        ->(value) { service.sanitize_body_multiloc(value, Comment::BODY_SANITIZE_FEATURES) }, 'Comment'
      )
      # A translation's rule depends on its own translatable_type and attribute_name, so reuse the
      # model's sanitiser rather than a value-only helper.
      MachineTranslations::MachineTranslation.where(rewritable.call('translation')).find_each do |mt|
        old_value = mt.translation
        mt.send(:sanitize_translation)
        new_value = mt.translation
        next if new_value == old_value

        script.reporter.add_change(
          old_value, new_value,
          context: { tenant: tenant.host, model: 'MachineTranslation', id: mt.id, attribute: 'translation' }
        )
        affected << { host: tenant.host, model: 'MachineTranslation', attribute: 'translation' }
        mt.update_columns(translation: new_value) if script.execute?
      rescue StandardError => e
        script.reporter.add_error(
          "#{e.class}: #{e.message}",
          context: { tenant: tenant.host, model: 'MachineTranslation', id: mt.id, attribute: 'translation' }
        )
      end
    end
  end
end
