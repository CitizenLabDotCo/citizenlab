# frozen_string_literal: true

# Rewrites the events nodes stored under the per-surface names (`Events` on the homepage,
# `EventsWidget` on project pages) to the shared `EventsList` widget, with the props that
# reproduce what each surface's own widget rendered. The front end resolves those names through
# shims until this has run everywhere; the dry run is the count that says when they can go.
#
# A bundle built before the shims cannot resolve `EventsList`, and a tab keeps its bundle until
# it reloads, so a rewrite crashes any such tab that then loads a rewritten page. That is why
# `execute` refuses to run before EARLIEST_EXECUTE_ON: the population of such tabs only drains
# with time. Move the date if the release slips; do not force past it.
#
# `revert` renames `EventsList` back to the name the layout's surface used before the shims, so
# that the front-end change stays revertible after this has run. Props set on `EventsList` nodes
# are lost by a revert (the surface widgets had none), and a node on a surface that had no events
# widget before is removed. The report holds every node as it was.
#
#     rake single_use:migrate_events_widgets                          # dry run: count nodes to rewrite, all tenants
#     rake 'single_use:migrate_events_widgets[execute]'               # rewrite, all tenants
#     rake 'single_use:migrate_events_widgets[execute,foo.com]'       # rewrite, one tenant
#     rake 'single_use:migrate_events_widgets[execute,,,force]'       # rewrite before EARLIEST_EXECUTE_ON
#     rake 'single_use:migrate_events_widgets[,,revert]'              # dry run of the revert
#     rake 'single_use:migrate_events_widgets[execute,,revert]'       # rename back, all tenants
namespace :single_use do
  desc "Rewrite Events / EventsWidget nodes to EventsList, or revert. Dry run unless passed 'execute'."
  task :migrate_events_widgets, %i[execute host revert force] => [:environment] do |_t, args|
    # Two weeks after the release that ships the shims (PR #14736).
    earliest_execute_on = Date.new(2026, 10, 1)
    canonical = ContentBuilder::Craftjs::Nodes::EVENTS_WIDGET_NAME

    # What each surface's own widget rendered, as props of the shared one.
    props_by_name = {
      'Events' => {
        'source' => 'all',
        'timeFilters' => ['upcoming'],
        'limit' => 3,
        'projectPublicationStatuses' => ['published'],
        'showEmptyMessage' => true
      },
      'EventsWidget' => {
        'source' => 'currentProject',
        'timeFilters' => %w[upcoming past],
        'limit' => 'all'
      }
    }

    # The name each surface stored before the shims, and the title its builder shows for it.
    surface_by_code = {
      ContentBuilder::Layout::HOMEPAGE_CODE => {
        'name' => 'Events',
        'title' => {
          'id' => 'app.containers.admin.ContentBuilder.homepage.events.eventsTitle',
          'defaultMessage' => 'Events'
        }
      },
      ContentBuilder::ProjectPageLayoutService::CODE => {
        'name' => 'EventsWidget',
        'title' => {
          'id' => 'app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle',
          'defaultMessage' => 'Events'
        }
      }
    }

    revert = args[:revert] == 'revert'
    force = args[:force] == 'force'
    names = revert ? [canonical] : props_by_name.keys
    template_tenant = ->(tenant) { tenant.host.include?('.template') || tenant.host.include?('-template') }
    remaining = Hash.new(0)
    tenant_lines = []

    if args[:execute] == 'execute' && !revert && !force && Date.current < earliest_execute_on
      raise ArgumentError, "refusing to execute before #{earliest_execute_on}: tabs on a bundle without " \
                           'the shims would crash. Pass force to override.'
    end

    rewrite = lambda do |node|
      ContentBuilder::Craftjs::Nodes
        .events(props_by_name.fetch(ContentBuilder::Craftjs::Query.resolved_name(node)), node['parent'])
        .merge(node.slice('hidden', 'nodes', 'linkedNodes'))
    end

    rename_back = lambda do |node, surface|
      node.merge(
        'type' => { 'resolvedName' => surface['name'] },
        'displayName' => surface['name'],
        'props' => {},
        'custom' => node.fetch('custom', {}).merge('title' => surface['title'])
      )
    end

    summary = lambda do |_script|
      # rubocop:disable Rails/Output -- run by hand at a terminal, like TenantScript itself.
      puts "   #{names.join(' + ')} nodes found: #{remaining.values.sum}"
      remaining.each { |name, count| puts "     #{name}: #{count}" }
      next if tenant_lines.empty?

      puts "\n   Per tenant (template tenants marked):"
      tenant_lines.each { |line| puts "     #{line}" }
      # rubocop:enable Rails/Output
    end

    TenantScript.run(
      revert ? 'migrate_events_widgets_revert' : 'migrate_events_widgets',
      args: args,
      description: revert ? "renaming #{canonical} nodes back to their surface names" : "rewriting events nodes to #{canonical}",
      # A tenant whose creation never finalized can still hold a template's layout, and the shims
      # can only go once no tenant that could be served holds a surface name.
      tenants: Tenant.not_deleted,
      summary: summary
    ) do |tenant, script|
      counts = Hash.new(0)

      ContentBuilder::Layout.with_widget_type(*names).find_each do |layout|
        state = ContentBuilder::Craftjs::State.new(layout.craftjs_json.deep_dup)
        surface = surface_by_code[layout.code]
        context = { tenant: tenant.host, layout_id: layout.id, code: layout.code }

        names.each do |name|
          state.nodes_by_resolved_name(name).each do |id, node|
            counts[name] += 1
            if revert && surface
              state.json[id] = rename_back.call(node, surface)
              script.reporter.add_change(node, state.json[id], context: context.merge(node_id: id))
            elsif revert
              state.delete_node(id)
              script.reporter.add_delete("#{canonical} node", id, context: context.merge(node: node))
            else
              state.json[id] = rewrite.call(node)
              script.reporter.add_change(node, state.json[id], context: context.merge(node_id: id))
            end
          end
        end

        # update_column: sanitization and validation are for admin input, and must not be able
        # to alter or block a rename on stored layouts.
        layout.update_column(:craftjs_json, state.json) if script.execute?
      end

      next if counts.empty?

      counts.each { |name, count| remaining[name] += count }
      marker = template_tenant.call(tenant) ? ' (template)' : ''
      tenant_lines << "#{tenant.host}#{marker}: #{counts.map { |name, count| "#{name}=#{count}" }.join(' ')}"
    end
  end
end
