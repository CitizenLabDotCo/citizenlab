# frozen_string_literal: true

namespace :single_use do
  desc 'Migrate accordion components from text-based to canvas-based'
  task migrate_accordion_to_canvas: :environment do
    puts "Starting accordion canvas migration..."
    
    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      migrate_tenant_accordions(tenant)
    end
    
    puts "\nMigration completed!"
  end

  private

  def migrate_tenant_accordions(tenant)
    tenant.switch do
      # Get all content builder layouts
      layouts = ContentBuilder::Layout.where.not("code LIKE 'backup/%'")
      
      puts "  Found #{layouts.count} layouts to process"
      
      layouts.each do |layout|
        migrate_layout_accordions(layout)
      end
    end
  end

  def migrate_layout_accordions(layout)
    craftjs_json = layout.craftjs_json
    return unless craftjs_json.is_a?(Hash)
    
    # Collect nodes to migrate before iterating to avoid modification during iteration
    nodes_to_migrate = []
    
    craftjs_json.each do |node_id, node|
      if should_migrate_accordion_node?(node)
        nodes_to_migrate << { node_id: node_id, node: node }
      end
    end
    
    if nodes_to_migrate.any?
      puts "    Layout #{layout.code}: Found #{nodes_to_migrate.length} accordion(s) to migrate"
      
      nodes_to_migrate.each do |item|
        migrate_accordion_node(layout, item[:node_id], item[:node])
      end
      
      # Save the updated layout
      layout.save!
      puts "    Layout #{layout.code}: Migration completed"
    end
  end

  def should_migrate_accordion_node?(node)
    return false unless node.is_a?(Hash)
    return false unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'
    return false if node['props']&.dig('text').blank? # No text to migrate
    
    # Check if text has actual content
    text_prop = node['props']['text']
    return false unless text_prop.is_a?(Hash)
    
    # Check if any locale has non-empty content
    text_prop.values.any? { |content| content.present? && content.strip.present? }
  end

  def migrate_accordion_node(layout, node_id, node)
    text_prop = node['props']['text'] || {}
    
    # Generate a unique ID for the new TextMultiloc node
    text_node_id = generate_node_id
    
    # Create the TextMultiloc child node
    text_node = {
      'type' => { 'resolvedName' => 'TextMultiloc' },
      'props' => { 'text' => text_prop },
      'parent' => node_id,
      'isCanvas' => false,
      'nodes' => [],
      'linkedNodes' => {},
      'custom' => {
        'title' => {
          'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
          'defaultMessage' => 'Text'
        }
      },
      'hidden' => false,
      'displayName' => 'TextMultiloc'
    }
    
    # Update the accordion node
    node['props'].delete('text')
    node['nodes'] = [text_node_id]
    
    # Add the new text node to the layout
    layout.craftjs_json[text_node_id] = text_node
    
    puts "      Created TextMultiloc node #{text_node_id} with content: #{text_prop.values.first&.truncate(50)}"
    
    true
  end

  def generate_node_id
    # Generate a unique ID similar to craft.js format
    SecureRandom.alphanumeric(11)
  end
end
