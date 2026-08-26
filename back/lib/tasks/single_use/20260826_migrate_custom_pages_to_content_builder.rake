# frozen_string_literal: true

# Derives a `custom_page` Content Builder layout for every global custom page, from the info
# sections, attachments and projects/events filter the page renders today.
#
# Run it while `custom_page_builder` is still off for the tenant: no admin can have opened the
# builder, so there is no builder edit for a re-derive to overwrite. `overwrite` refuses a
# tenant whose flag is already active unless `force` is also passed.
#
#     rake single_use:migrate_custom_pages_to_content_builder                             # dry run, all tenants
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute]'                  # create, all tenants
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute,foo.com]'          # create, one tenant
#     rake 'single_use:migrate_custom_pages_to_content_builder[execute,foo.com,overwrite]' # re-derive existing layouts
namespace :single_use do
  desc "Derive Content Builder layouts for global custom pages. Dry run unless passed 'execute'."
  task :migrate_custom_pages_to_content_builder, %i[execute host overwrite force] => [:environment] do |_t, args|
    overwrite = args[:overwrite] == 'overwrite'
    force = args[:force] == 'force'
    code = ContentBuilder::CustomPageLayoutService::CODE
    service = ContentBuilder::CustomPageLayoutService.new
    refusals = []
    archived = []

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

    summary = lambda do |_script|
      puts "   Disabled sections not migrated: #{archived.size}"
      puts "   Tenants refused (flag already active): #{refusals.size}"
      refusals.each { |host| puts "     - #{host}" }
    end

    TenantScript.run(
      'migrate_custom_pages_to_content_builder',
      args: args,
      description: 'deriving Content Builder layouts for global custom pages',
      summary: summary
    ) do |tenant, script|
      if overwrite && !force && AppConfiguration.instance.feature_activated?('custom_page_builder')
        refusals << tenant.host
        script.reporter.add_error(
          'refused: custom_page_builder is active, so a builder edit could be overwritten. Pass force to override.',
          context: { tenant: tenant.host }
        )
        next
      end

      StaticPage.where(code: 'custom', project_id: nil).find_each do |page|
        archive_disabled_sections.call(page, tenant, script)

        context = { tenant: tenant.host, page_id: page.id, slug: page.slug }
        layout = ContentBuilder::Layout.find_by(content_buildable: page, code: code)
        craftjs_json = service.craftjs_json_for(page)

        if layout.nil?
          script.reporter.add_create('ContentBuilder::Layout', { code: code, node_ids: craftjs_json.keys }, context: context)
          if script.execute?
            ContentBuilder::Layout.create!(
              content_buildable: page, code: code, enabled: true, craftjs_json: craftjs_json
            )
          end
        elsif overwrite && layout.craftjs_json != craftjs_json
          # Node ids are deterministic, so an unchanged page derives identically and is skipped
          # here — a re-run settles rather than rewriting every row.
          script.reporter.add_change(layout.craftjs_json.keys, craftjs_json.keys, context: context.merge(layout_id: layout.id))
          layout.update!(craftjs_json: craftjs_json) if script.execute?
        end
      end
    end
  end
end
