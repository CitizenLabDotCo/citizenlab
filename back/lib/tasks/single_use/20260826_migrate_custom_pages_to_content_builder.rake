# frozen_string_literal: true

# Derives a `custom_page` Content Builder layout for every global custom page, from the info
# sections, attachments and projects/events filter the page renders today.
#
# Run it while `custom_page_builder` is still off for the tenant. That ordering is what keeps
# the task simple: with the flag off no admin can have opened the builder, so there is no
# builder edit to protect and re-deriving is always safe. `overwrite` therefore refuses a
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

    # Content in a switched-off info section is not migrated: it renders nowhere today, so
    # leaving it behind changes nothing a resident can see. The columns keep it until the
    # cutover drops them, and this report is the only record that survives that — so it holds
    # every locale's HTML verbatim, not a summary.
    #
    # Recorded as a change to nothing rather than in a bucket of its own: ScriptReporter has
    # no slot for "deliberately dropped", and `add_change` is the only one that can carry the
    # payload (`add_delete` takes an id, not attributes). The summary below counts them
    # separately so they do not read as writes.
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
          # Node ids are deterministic, so an unchanged page derives byte-identically and is
          # left alone — a re-run settles rather than rewriting every row.
          script.reporter.add_change(layout.craftjs_json.keys, craftjs_json.keys, context: context.merge(layout_id: layout.id))
          layout.update!(craftjs_json: craftjs_json) if script.execute?
        end
      end
    end
  end
end
