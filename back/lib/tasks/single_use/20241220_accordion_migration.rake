# frozen_string_literal: true

namespace :single_use do
  desc 'Migrate existing accordion components to canvas mode with TextMultiloc children. Use DRY_RUN=true for analysis only.'

  task accordion_migration: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'

    if dry_run
      puts 'DRY RUN: Analyzing accordion migration without making changes...'
    else
      puts 'Starting accordion migration to canvas mode...'
    end
    puts '=' * 80

    total_accordions = 0
    text_based_accordions = 0
    already_canvas_accordions = 0
    accordions_with_content = 0
    accordions_to_migrate = 0
    layouts_with_accordions = 0
    migrated_count = 0

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      tenant_stats = process_tenant_accordions(tenant, dry_run)

      total_accordions += tenant_stats[:total_accordions]
      text_based_accordions += tenant_stats[:text_based_accordions]
      already_canvas_accordions += tenant_stats[:already_canvas_accordions]
      accordions_with_content += tenant_stats[:accordions_with_content]
      accordions_to_migrate += tenant_stats[:accordions_to_migrate]
      layouts_with_accordions += tenant_stats[:layouts_with_accordions]
      migrated_count += tenant_stats[:migrated_count] unless dry_run
    end

    puts "\n#{'=' * 80}"
    if dry_run
      puts '📊 DRY RUN SUMMARY (All Tenants):'
    else
      puts '📊 MIGRATION SUMMARY (All Tenants):'
    end
    puts "   Total accordions found: #{total_accordions}"
    puts "   Text-based accordions: #{text_based_accordions}"
    puts "   Already canvas accordions: #{already_canvas_accordions}"
    puts "   Accordions with content: #{accordions_with_content}"
    puts "   Layouts with accordions: #{layouts_with_accordions}"

    if dry_run
      puts "   Accordions that WOULD BE migrated: #{accordions_to_migrate}"
      puts "\n💡 To run the actual migration:"
      puts '   docker compose run web bundle exec rake single_use:accordion_migration'
    else
      puts "   Accordions migrated: #{migrated_count}"
      puts "\n✅ Migration completed successfully!"
    end
    puts '=' * 80
  end

  private

  def process_tenant_accordions(tenant, dry_run)
    stats = {
      total_accordions: 0,
      text_based_accordions: 0,
      already_canvas_accordions: 0,
      accordions_with_content: 0,
      accordions_to_migrate: 0,
      layouts_with_accordions: 0,
      migrated_count: 0
    }

    tenant.switch do
      ContentBuilder::Layout.find_each do |layout|
        next unless layout.craftjs_json.is_a?(Hash)

        layout_stats = process_layout_accordions(layout, dry_run)

        # Aggregate stats
        stats[:total_accordions] += layout_stats[:total_accordions]
        stats[:text_based_accordions] += layout_stats[:text_based_accordions]
        stats[:already_canvas_accordions] += layout_stats[:already_canvas_accordions]
        stats[:accordions_with_content] += layout_stats[:accordions_with_content]
        stats[:accordions_to_migrate] += layout_stats[:accordions_to_migrate]
        stats[:layouts_with_accordions] += 1 if layout_stats[:total_accordions] > 0
        stats[:migrated_count] += layout_stats[:migrated_count] unless dry_run
      end
    end

    stats
  end

  def process_layout_accordions(layout, dry_run)
    layout_stats = {
      total_accordions: 0,
      text_based_accordions: 0,
      already_canvas_accordions: 0,
      accordions_with_content: 0,
      accordions_to_migrate: 0,
      migrated_count: 0
    }

    # Collect nodes to migrate first to avoid modification during iteration
    accordion_nodes = find_accordion_nodes(layout.craftjs_json)
    return layout_stats if accordion_nodes.empty?

    layout_stats[:total_accordions] = accordion_nodes.count
    nodes_to_migrate = []

    accordion_nodes.each do |node_id, node|
      # Check if already in canvas mode
      if node.dig('craft', 'props', 'isCanvas') == true
        layout_stats[:already_canvas_accordions] += 1
        if dry_run
          puts "  📋 Layout: #{layout.code || layout.id}"
          puts "     └─ Accordion Node: #{node_id}"
          puts '        Already in canvas mode'
        end
        next
      end

      # Check for text content in the correct location
      text_content = node.dig('props', 'text') || node.dig('craft', 'props', 'text')
      layout_stats[:text_based_accordions] += 1

      if text_content.present? && text_content.values.any?(&:present?)
        layout_stats[:accordions_with_content] += 1
        layout_stats[:accordions_to_migrate] += 1
        nodes_to_migrate << { node_id: node_id, node: node, text_prop: text_content }

        if dry_run
          puts "  📋 Layout: #{layout.code || layout.id}"
          puts "     └─ Accordion Node: #{node_id}"
          puts '        Has text content - WOULD BE MIGRATED'
          puts "           Text locales: #{text_content.keys.join(', ')}"
          puts "           Sample text: #{text_content.values.first&.truncate(100)}"
          puts '           Would create TextMultiloc child component'
          puts '           Would create Container wrapper'
          puts '           Would update accordion to use linkedNodes'
          puts '           Would remove text property from accordion'
        end
      elsif dry_run && text_content.present?
        puts "  📋 Layout: #{layout.code || layout.id}"
        puts "     └─ Accordion Node: #{node_id}"
        puts '        Has empty text property - WOULD BE CLEANED UP'
        puts '         Would remove empty text property'
      end
    end

    # Process migrations if not dry run
    if !dry_run && nodes_to_migrate.any?
      puts "  Processing layout: #{layout.code || layout.id}"

      nodes_to_migrate.each do |migration_data|
        migrate_accordion_node(layout, migration_data)
      end

      layout.save!
      layout_stats[:migrated_count] = nodes_to_migrate.length
      puts "    Migrated #{nodes_to_migrate.length} accordion(s)"
    end

    layout_stats
  end

  def find_accordion_nodes(craftjs_json)
    accordion_nodes = {}

    craftjs_json.each do |node_id, node|
      next unless node.is_a?(Hash)
      next unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'

      accordion_nodes[node_id] = node
    end

    accordion_nodes
  end

  def migrate_accordion_node(layout, migration_data)
    node_id = migration_data[:node_id]
    node = migration_data[:node]
    text_prop = migration_data[:text_prop]

    # Create a Container node to wrap the text content (this is how working accordions are structured)
    container_node_id = "#{node_id}_container"
    container_node = {
      'type' => { 'resolvedName' => 'Container' },
      'props' => {},
      'nodes' => [],
      'custom' => {},
      'isCanvas' => true,
      'hidden' => false,
      'linkedNodes' => {},
      'parent' => node_id
    }

    # Create a new TextMultiloc node inside the container
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
      'linkedNodes' => {},
      'parent' => container_node_id
    }

    # Add both nodes to the layout
    layout.craftjs_json[container_node_id] = container_node
    layout.craftjs_json[text_node_id] = text_node

    # CRITICAL: Update the Container's nodes array to include the TextMultiloc
    container_node['nodes'] = [text_node_id]

    # Update the accordion node to use linkedNodes pointing to the container
    node['linkedNodes'] = { 'accordion-content' => container_node_id }
    node['custom']['hasChildren'] = true

    # Keep isCanvas as false (this is how working accordions are structured)
    node['isCanvas'] = false

    # Remove the text prop from the accordion (it's now in the child TextMultiloc)
    # Be explicit about removing the text property
    if node['props']&.key?('text')
      node['props'] = node['props'].except('text')
    end

    puts "    Migrated accordion #{node_id} with text content"
  end
end
