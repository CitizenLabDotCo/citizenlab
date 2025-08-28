# frozen_string_literal: true

namespace :single_use do
  desc 'Rollback accordion migration from canvas mode back to text-based'

  task rollback_accordion_migration: :environment do
    puts 'Starting accordion migration rollback...'

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      rollback_accordions_for_tenant(tenant)
    end

    puts "\nAccordion rollback completed!"
  end

  private

  def rollback_accordions_for_tenant(tenant)
    tenant.switch do
      # Find all ContentBuilder::Layout records
      layouts = ContentBuilder::Layout.all

      layouts.each do |layout|
        next unless layout.craftjs_json.is_a?(Hash)

        puts "  Processing layout: #{layout.code || layout.id}"

        # Collect nodes to rollback first to avoid modification during iteration
        nodes_to_rollback = []

        layout.craftjs_json.each do |node_id, node|
          next unless node.is_a?(Hash)
          next unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'

          # Check if this accordion is in canvas mode and has TextMultiloc children
          next unless node['isCanvas'] == true
          next unless node['nodes'].is_a?(Array) && node['nodes'].any?

          nodes_to_rollback << { node_id: node_id, node: node }
        end

        # Rollback collected nodes
        nodes_to_rollback.each do |rollback_data|
          rollback_accordion_node(layout, rollback_data)
        end

        # Save the layout if any changes were made
        if nodes_to_rollback.any?
          layout.save!
          puts "    Rolled back #{nodes_to_rollback.length} accordion(s)"
        else
          puts '    No accordions to rollback'
        end
      end
    end
  end

  def rollback_accordion_node(layout, rollback_data)
    node_id = rollback_data[:node_id]
    node = rollback_data[:node]

    # Find the first TextMultiloc child node
    text_node_id = node['nodes'].find do |child_id|
      child_node = layout.craftjs_json[child_id]
      child_node&.dig('type', 'resolvedName') == 'TextMultiloc'
    end

    if text_node_id
      text_node = layout.craftjs_json[text_node_id]
      text_prop = text_node&.dig('props', 'text') || {}

      # Restore the text prop to the accordion
      node['props']['text'] = text_prop

      # Remove the text node from the layout
      layout.craftjs_json.delete(text_node_id)

      # Remove the text node from the accordion's nodes array
      node['nodes'].delete(text_node_id)

      # If no more children, set isCanvas to false
      node['isCanvas'] = false if node['nodes'].empty?

      puts "    Rolled back accordion #{node_id} with text content"
    else
      puts "    Warning: No TextMultiloc child found for accordion #{node_id}"
    end
  end
end
