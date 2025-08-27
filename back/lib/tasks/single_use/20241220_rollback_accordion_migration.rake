# frozen_string_literal: true

namespace :single_use do
  desc 'Rollback accordion migration: convert canvas-based accordions back to text-based'
  task rollback_accordion_migration: :environment do
    puts "Starting accordion migration rollback..."
    
    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      rollback_tenant_accordions(tenant)
    end
    
    puts "\nRollback completed!"
  end

  private

  def rollback_tenant_accordions(tenant)
    tenant.switch do
      # Get all content builder layouts
      layouts = ContentBuilder::Layout.where.not("code LIKE 'backup/%'")
      
      puts "  Found #{layouts.count} layouts to process"
      
      layouts.each do |layout|
        rollback_layout_accordions(layout)
      end
    end
  end

  def rollback_layout_accordions(layout)
    craftjs_json = layout.craftjs_json
    return unless craftjs_json.is_a?(Hash)
    
    # Collect nodes to rollback before iterating to avoid modification during iteration
    nodes_to_rollback = []
    
    craftjs_json.each do |node_id, node|
      if should_rollback_accordion_node?(node)
        nodes_to_rollback << { node_id: node_id, node: node }
      end
    end
    
    if nodes_to_rollback.any?
      puts "    Layout #{layout.code}: Found #{nodes_to_rollback.length} accordion(s) to rollback"
      
      nodes_to_rollback.each do |item|
        rollback_accordion_node(layout, item[:node_id], item[:node])
      end
      
      # Save the updated layout
      layout.save!
      puts "    Layout #{layout.code}: Rollback completed"
    end
  end

  def should_rollback_accordion_node?(node)
    return false unless node.is_a?(Hash)
    return false unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'
    return false if node['nodes'].blank? # No children to extract
    
    # We'll check for TextMultiloc children in the rollback function
    true
  end

  def rollback_accordion_node(layout, node_id, node)
    # Find the TextMultiloc child
    text_node_id = node['nodes'].find do |child_id|
      child_node = layout.craftjs_json[child_id]
      child_node&.dig('type', 'resolvedName') == 'TextMultiloc'
    end
    
    return false unless text_node_id
    
    text_node = layout.craftjs_json[text_node_id]
    text_prop = text_node['props']['text']
    
    # Restore the text property to the accordion
    node['props']['text'] = text_prop
    node['nodes'] = []
    
    # Remove the TextMultiloc child node
    layout.craftjs_json.delete(text_node_id)
    
    puts "      Restored text content: #{text_prop.values.first&.truncate(50)}"
    
    true
  end
end
