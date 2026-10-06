# frozen_string_literal: true

# Derives a `custom_page` Content Builder layout for every page on the builder (global custom pages,
# About and FAQ), from the banner, title, info sections and attachments the page renders. It derives
# whatever CustomPageLayoutService emits. A layout derived before a widget existed lacks its node;
# `overwrite` re-derives it, which is the upgrade path for an already-migrated page.
#
# Run it while `custom_page_builder` is still off for the tenant: no admin can have opened the
# builder, so there is no builder edit for a re-derive to overwrite. `overwrite` refuses a
# tenant whose flag is already active unless `force` is also passed.
#
# `cutover` re-derives like `overwrite`, then switches the flag on, one tenant at a time. A tenant
# with any page that fails to derive keeps the flag off, so no tenant ends up half migrated. A
# tenant whose flag is already on is skipped, so a failed run can be re-run as is.
#
#     rake single_use:migrate_custom_pages_to_content_builder                             # dry run, all tenants
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute]'                  # create, all tenants
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute,foo.com]'          # create, one tenant
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute,foo.com,overwrite]' # re-derive existing layouts
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute,,cutover]'         # re-derive and switch on, all tenants (empty host)
namespace :single_use do
  desc "Derive Content Builder layouts for custom, About and FAQ pages. Dry run unless passed 'execute'."
  task :migrate_custom_pages_to_content_builder, %i[execute host mode force] => [:environment] do |_t, args|
    cutover = args[:mode] == 'cutover'
    overwrite = cutover || args[:mode] == 'overwrite'
    force = args[:force] == 'force'
    code = ContentBuilder::CustomPageLayoutService::CODE
    service = ContentBuilder::CustomPageLayoutService.new
    refusals = []
    archived = []
    dropped_lists = []
    switched_on = []
    already_on = []
    kept_off = []
    rederived = []
    missed_edits = []

    # A switched-off section renders nowhere today, so it is not migrated. Its content stays
    # in the column until the cutover drops it, and this report is then the only record left —
    # hence every locale verbatim.
    #
    # Recorded via add_change because ScriptReporter has no bucket for "dropped", and it is the
    # only one that carries a payload. The summary counts them apart from real writes.
    archive_disabled_sections = lambda do |page, tenant, script|
      {
        top_info_section: [page.top_info_section_enabled, page.top_info_section_multiloc],
        bottom_info_section: [page.bottom_info_section_enabled, page.bottom_info_section_multiloc]
      }.each do |section, (enabled, multiloc)|
        next if enabled || multiloc.blank? || multiloc.values.all?(&:blank?)

        archived << section
        script.reporter.add_change(
          multiloc,
          nil,
          context: { tenant: tenant.host, page_id: page.id, slug: page.slug, section: section, reason: 'section disabled' }
        )
      end
    end

    # A projects or events list can be switched on and still derive nothing: the page has no
    # project filter, or the tenant has no `advanced_custom_pages`. The setting goes at the
    # cutover with the columns, so the report is the last record that it was ever on. Read from
    # the derived graph rather than re-deriving the rules, which live in the layout service.
    archive_dropped_lists = lambda do |page, craftjs, tenant, script|
      {
        projects: [page.projects_enabled, ContentBuilder::CustomPageLayoutService::PROJECTS_ID],
        events: [page.events_widget_enabled, ContentBuilder::CustomPageLayoutService::EVENTS_ID]
      }.each do |section, (enabled, node_id)|
        next if !enabled || craftjs.key?(node_id)

        dropped_lists << section
        script.reporter.add_change(
          { 'enabled' => true, 'projects_filter_type' => page.projects_filter_type },
          nil,
          context: { tenant: tenant.host, page_id: page.id, slug: page.slug, section: section, reason: 'list not migrated' }
        )
      end
    end

    summary = lambda do |_script|
      puts "   Disabled sections not migrated: #{archived.size}"
      puts "   Lists switched on but not migrated: #{dropped_lists.size}"
      puts "   Tenants refused (flag already active): #{refusals.size}"
      refusals.each { |host| puts "     - #{host}" }
      return unless cutover

      puts "   Tenants switched on: #{switched_on.size}"
      puts "   Tenants skipped (flag already active): #{already_on.size}"
      already_on.each { |host| puts "     - #{host}" }
      puts "   Tenants kept off (a page failed to derive): #{kept_off.size}"
      kept_off.each { |host| puts "     - #{host}" }
      puts "   Pages re-derived after an edit during the switch: #{rederived.size}"
      puts "   Pages edited during the switch but not re-derived: #{missed_edits.size}"
    end

    # Returns the page's layout as the run leaves it: nil on a dry run that would create one.
    derive = lambda do |page, tenant, script|
      context = { tenant: tenant.host, page_id: page.id, slug: page.slug }
      layout = ContentBuilder::Layout.find_by(content_buildable: page, code: code)
      # A dry run must not copy banner images; the derived graph is the same either way.
      craftjs_json = service.craftjs_json_for(page, persist_images: script.execute?)
      archive_dropped_lists.call(page, craftjs_json, tenant, script)

      if layout.nil?
        script.reporter.add_create('ContentBuilder::Layout', { code: code, node_ids: craftjs_json.keys }, context: context)
        if script.execute?
          layout = ContentBuilder::Layout.create!(
            content_buildable: page, code: code, enabled: true, craftjs_json: craftjs_json
          )
        end
      elsif overwrite && layout.craftjs_json != craftjs_json
        # Node ids are deterministic, so an unchanged page derives identically and is skipped
        # here — a re-run settles rather than rewriting every row.
        script.reporter.add_change(layout.craftjs_json.keys, craftjs_json.keys, context: context.merge(layout_id: layout.id))
        layout.update!(craftjs_json: craftjs_json) if script.execute?
      end
      layout&.reload
    end

    # A legacy edit saved between a page's derivation and the flag switch would be lost. Such a
    # page is derived again, but only while its layout is still the one this run left, so an
    # admin's first builder edit is never overwritten.
    catch_up = lambda do |seen, tenant, script|
      StaticPage.where(id: seen.keys).find_each do |page|
        page_updated_at, layout = seen[page.id]
        next if page.updated_at == page_updated_at

        context = { tenant: tenant.host, page_id: page.id, slug: page.slug }
        if layout && ContentBuilder::Layout.exists?(id: layout.id, updated_at: layout.updated_at)
          rederived << page.id
          derive.call(page, tenant, script)
        else
          missed_edits << page.id
          script.reporter.add_error('edited during the switch, layout already changed: not re-derived', context: context)
        end
      end
    end

    TenantScript.run(
      'migrate_custom_pages_to_content_builder',
      args: args,
      description: 'deriving Content Builder layouts for custom, About and FAQ pages',
      summary: summary
    ) do |tenant, script|
      flag_active = AppConfiguration.instance.feature_activated?('custom_page_builder')
      if cutover && flag_active
        already_on << tenant.host
        next
      end

      if overwrite && !force && flag_active
        refusals << tenant.host
        script.reporter.add_error(
          'refused: custom_page_builder is active, so a builder edit could be overwritten. Pass force to override.',
          context: { tenant: tenant.host }
        )
        next
      end

      seen = {}
      failures = 0
      StaticPage.content_builder_pages.find_each do |page|
        archive_disabled_sections.call(page, tenant, script)
        seen[page.id] = [page.updated_at, derive.call(page, tenant, script)]
      rescue StandardError => e
        # Carry on, so one run lists every page that needs fixing before the tenant can switch.
        failures += 1
        script.reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host, page_id: page.id, slug: page.slug })
      end
      next unless cutover

      if failures.positive?
        kept_off << tenant.host
        script.reporter.add_error(
          "flag left off: #{failures} page(s) failed to derive",
          context: { tenant: tenant.host, feature: 'custom_page_builder' }
        )
        next
      end

      # Recorded only once the switch has saved, so a failed save is never reported as switched.
      SettingsService.new.activate_feature!('custom_page_builder') if script.execute?
      switched_on << tenant.host
      script.reporter.add_change(false, true, context: { tenant: tenant.host, feature: 'custom_page_builder' })
      catch_up.call(seen, tenant, script) if script.execute?
    end
  end
end
