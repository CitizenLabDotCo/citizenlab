# frozen_string_literal: true

# Switches on the empty-state message (`showEmptyMessage`) for the events widgets on custom pages
# and project static pages, so a widget with no events says so instead of disappearing. Only
# `custom_page` layouts: project description pages keep hiding an empty widget, and the homepage
# already shows the message.
#
# A widget without the prop is switched on. One an admin switched off keeps `false`.
#
# The front end already reads the prop, so the message shows as soon as the task runs. Run it after
# the release that adds the setting, or admins have no way to switch the message off again.
#
#     rake single_use:show_empty_message_on_custom_page_events_widgets                    # dry run, all tenants
#     rake 'single_use:show_empty_message_on_custom_page_events_widgets[execute]'         # write, all tenants
#     rake 'single_use:show_empty_message_on_custom_page_events_widgets[execute,foo.com]' # write, one tenant
namespace :single_use do
  desc "Show the empty-state message on custom page events widgets. Dry run unless passed 'execute'."
  task :show_empty_message_on_custom_page_events_widgets, %i[execute host] => [:environment] do |_t, args|
    widget_name = ContentBuilder::Craftjs::Nodes::EVENTS_WIDGET_NAME
    total = 0

    summary = lambda do |_script|
      puts "   #{widget_name} widgets to change: #{total}"
    end

    TenantScript.run(
      'show_empty_message_on_custom_page_events_widgets',
      args: args,
      description: "switching on the empty-state message of #{widget_name} widgets on custom pages",
      summary: summary
    ) do |tenant, script|
      ContentBuilder::Layout
        .where(code: ContentBuilder::CustomPageLayoutService::CODE)
        .with_widget_type(widget_name)
        .find_each do |layout|
          state = ContentBuilder::Craftjs::State.new(layout.craftjs_json.deep_dup)
          changed = false

          state.nodes_by_resolved_name(widget_name).each do |id, node|
            next if node['props'].key?('showEmptyMessage')

            updated = node.merge('props' => node['props'].merge('showEmptyMessage' => true))
            state.json[id] = updated
            changed = true
            total += 1
            script.reporter.add_change(
              node, updated,
              context: { tenant: tenant.host, layout_id: layout.id, node_id: id }
            )
          end

          # update_column: sanitization and validation are for admin input, and must not be able
          # to alter or block a prop added to stored layouts.
          layout.update_column(:craftjs_json, state.json) if changed && script.execute?
        end
    end
  end
end
