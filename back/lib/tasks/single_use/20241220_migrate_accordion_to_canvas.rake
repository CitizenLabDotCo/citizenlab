# frozen_string_literal: true

namespace :single_use do
  desc 'Migrate existing accordion components to canvas mode with TextMultiloc children'

  task migrate_accordion_to_canvas: :environment do
    puts 'Starting accordion migration to canvas mode...'

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      migrate_accordions_for_tenant(tenant)
    end

    puts "\nAccordion migration completed!"
  end

  private

  def migrate_accordions_for_tenant(tenant)
    tenant.switch do
      # Find all ContentBuilder::Layout records
      layouts = ContentBuilder::Layout.all

      layouts.each do |layout|
        next unless layout.craftjs_json.is_a?(Hash)

        puts "  Processing layout: #{layout.code || layout.id}"

        # Collect nodes to migrate first to avoid modification during iteration
        nodes_to_migrate = []

        layout.craftjs_json.each do |node_id, node|
          next unless node.is_a?(Hash)
          next unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'

          # Check if this accordion has text content that needs migration
          text_prop = node['props']&.dig('text')
          next unless text_prop.is_a?(Hash) && text_prop.values.any?(&:present?)

          nodes_to_migrate << { node_id: node_id, node: node, text_prop: text_prop }
        end

        # Migrate collected nodes
        nodes_to_migrate.each do |migration_data|
          migrate_accordion_node(layout, migration_data)
        end

        # Save the layout if any changes were made
        if nodes_to_migrate.any?
          layout.save!
          puts "    Migrated #{nodes_to_migrate.length} accordion(s)"
        else
          puts '    No accordions to migrate'
        end
      end
    end
  end

  def migrate_accordion_node(layout, migration_data)
    node_id = migration_data[:node_id]
    node = migration_data[:node]
    text_prop = migration_data[:text_prop]

    # Create a new TextMultiloc node
    text_node_id = "#{node_id}_text"
    text_node = {
      'type' => { 'resolvedName' => 'TextMultiloc' },
      'props' => {
        'text' => text_prop
      },
      'nodes' => [],
      'custom' => {},
      'isCanvas' => false,
      'hidden' => false,
      'linkedNodes' => {}
    }

    # Add the text node to the layout
    layout.craftjs_json[text_node_id] = text_node

    # Update the accordion node to be a canvas and include the text node
    node['nodes'] = [text_node_id]
    node['isCanvas'] = true

    # Remove the text prop from the accordion (it's now in the child TextMultiloc)
    node['props'].delete('text')

    puts "    Migrated accordion #{node_id} with text content"
  end
end
