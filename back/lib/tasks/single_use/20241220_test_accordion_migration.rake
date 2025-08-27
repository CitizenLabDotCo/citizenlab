# frozen_string_literal: true

namespace :single_use do
  desc 'Test accordion migration: analyze what would be migrated without making changes'
  task test_accordion_migration: :environment do
    puts "Testing accordion migration..."
    
    total_layouts = 0
    total_accordions = 0
    total_to_migrate = 0
    
    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      tenant_stats = test_tenant_accordions(tenant)
      total_layouts += tenant_stats[:layouts]
      total_accordions += tenant_stats[:accordions]
      total_to_migrate += tenant_stats[:to_migrate]
    end
    
    puts "\n" + "=" * 50
    puts "MIGRATION TEST SUMMARY"
    puts "=" * 50
    puts "Total layouts processed: #{total_layouts}"
    puts "Total accordion components found: #{total_accordions}"
    puts "Accordion components that would be migrated: #{total_to_migrate}"
    puts "Migration coverage: #{(total_to_migrate.to_f / [total_accordions, 1].max * 100).round(1)}%"
    puts "=" * 50
  end

  private

  def test_tenant_accordions(tenant)
    tenant.switch do
      # Get all content builder layouts
      layouts = ContentBuilder::Layout.where.not("code LIKE 'backup/%'")
      
      puts "  Found #{layouts.count} layouts to process"
      
      tenant_accordions = 0
      tenant_to_migrate = 0
      
      layouts.each do |layout|
        layout_stats = analyze_layout_accordions(layout)
        tenant_accordions += layout_stats[:accordions]
        tenant_to_migrate += layout_stats[:to_migrate]
      end
      
      { layouts: layouts.count, accordions: tenant_accordions, to_migrate: tenant_to_migrate }
    end
  end

  def analyze_layout_accordions(layout)
    craftjs_json = layout.craftjs_json
    return { accordions: 0, to_migrate: 0 } unless craftjs_json.is_a?(Hash)
    
    layout_accordions = 0
    layout_to_migrate = 0
    
    craftjs_json.each do |node_id, node|
      if node.is_a?(Hash) && node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'
        layout_accordions += 1
        
        if should_migrate_accordion_node?(node)
          layout_to_migrate += 1
        end
      end
    end
    
    if layout_accordions > 0
      puts "    Layout #{layout.code}: #{layout_accordions} accordion(s), #{layout_to_migrate} would be migrated"
    end
    
    { accordions: layout_accordions, to_migrate: layout_to_migrate }
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
end
