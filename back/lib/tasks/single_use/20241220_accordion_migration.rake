# frozen_string_literal: true

namespace :single_use do
  desc 'Migrate existing accordion components to canvas mode with TextMultiloc children. Use DRY_RUN=true for analysis only.'

  task accordion_migration: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'

    if dry_run
      Rails.logger.info '🔍 DRY RUN MODE: Analyzing accordion migration without making any changes...'
      Rails.logger.info '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    else
      Rails.logger.info '🚀 MIGRATION MODE: Starting accordion migration to canvas mode...'
      Rails.logger.info '⚠️  THIS WILL MODIFY THE DATABASE'
    end
    Rails.logger.info '=' * 80

    total_accordions = 0
    text_based_accordions = 0
    already_canvas_accordions = 0
    accordions_with_content = 0
    accordions_to_migrate = 0
    layouts_with_accordions = 0
    migrated_count = 0

    # Process all tenants
    tenant_reports = []
    Tenant.all.each do |tenant|
      Rails.logger.info "\n🏢 Processing tenant: #{tenant.host}"
      tenant_stats = process_tenant_accordions(tenant, dry_run)

      # Store detailed tenant report
      tenant_reports << {
        host: tenant.host,
        stats: tenant_stats
      }

      # Log per-tenant summary
      if dry_run
        if tenant_stats[:accordions_to_migrate] > 0
          Rails.logger.info "   📊 WOULD MIGRATE: #{tenant_stats[:accordions_to_migrate]} accordions"
        else
          Rails.logger.info '   ✅ No accordions need migration'
        end
      else
        if tenant_stats[:migrated_count] > 0
          Rails.logger.info "   ✅ MIGRATED: #{tenant_stats[:migrated_count]} accordions"
        elsif tenant_stats[:total_accordions] > 0
          Rails.logger.info '   ℹ️  No accordions needed migration (already processed)'
        else
          Rails.logger.info '   📭 No accordions found'
        end
        if tenant_stats[:errors] > 0
          Rails.logger.info "   ⚠️  ERRORS: #{tenant_stats[:errors]} accordions failed"
        end
      end

      total_accordions += tenant_stats[:total_accordions]
      text_based_accordions += tenant_stats[:text_based_accordions]
      already_canvas_accordions += tenant_stats[:already_canvas_accordions]
      accordions_with_content += tenant_stats[:accordions_with_content]
      accordions_to_migrate += tenant_stats[:accordions_to_migrate]
      layouts_with_accordions += tenant_stats[:layouts_with_accordions]
      migrated_count += tenant_stats[:migrated_count] unless dry_run
    end

    Rails.logger.info "\n#{'=' * 80}"
    if dry_run
      Rails.logger.info '📊 DRY RUN SUMMARY (All Tenants):'
    else
      Rails.logger.info '📊 MIGRATION SUMMARY (All Tenants):'
    end
    Rails.logger.info "   Total accordions found: #{total_accordions}"
    Rails.logger.info "   Text-based accordions: #{text_based_accordions}"
    Rails.logger.info "   Already canvas accordions: #{already_canvas_accordions}"
    Rails.logger.info "   Accordions with content: #{accordions_with_content}"
    Rails.logger.info "   Layouts with accordions: #{layouts_with_accordions}"

    if dry_run
      Rails.logger.info "   Accordions that WOULD BE migrated: #{accordions_to_migrate}"

      # Show detailed per-tenant dry run analysis
      Rails.logger.info "\n📋 DETAILED DRY RUN ANALYSIS:"
      tenant_reports.each do |report|
        stats = report[:stats]
        if stats[:accordions_to_migrate] > 0
          Rails.logger.info "   🔄 #{report[:host]}: #{stats[:accordions_to_migrate]} accordions to migrate"
        end
      end

      Rails.logger.info "\n💡 To run the actual migration:"
      Rails.logger.info '   docker compose run web bundle exec rake single_use:accordion_migration'
    else
      Rails.logger.info "   Accordions migrated: #{migrated_count}"

      # Show detailed per-tenant migration results
      Rails.logger.info "\n📋 DETAILED MIGRATION RESULTS:"
      tenant_reports.each do |report|
        stats = report[:stats]
        if stats[:migrated_count] > 0
          Rails.logger.info "   ✅ #{report[:host]}: #{stats[:migrated_count]} accordions migrated"
        elsif stats[:errors] > 0
          Rails.logger.info "   ❌ #{report[:host]}: #{stats[:errors]} errors occurred"
        end
      end

      Rails.logger.info "\n✅ Migration completed successfully!"
    end
    Rails.logger.info '=' * 80
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
      migrated_count: 0,
      errors: 0
    }

    tenant.switch do
      ContentBuilder::Layout.find_each do |layout|
        next unless layout.craftjs_json.is_a?(Hash)

        begin
          layout_stats = process_layout_accordions(layout, dry_run)

          # Aggregate stats
          stats[:total_accordions] += layout_stats[:total_accordions]
          stats[:text_based_accordions] += layout_stats[:text_based_accordions]
          stats[:already_canvas_accordions] += layout_stats[:already_canvas_accordions]
          stats[:accordions_with_content] += layout_stats[:accordions_with_content]
          stats[:accordions_to_migrate] += layout_stats[:accordions_to_migrate]
          stats[:layouts_with_accordions] += 1 if layout_stats[:total_accordions] > 0
          stats[:migrated_count] += layout_stats[:migrated_count] unless dry_run
          stats[:errors] += layout_stats[:errors]
        rescue StandardError => e
          Rails.logger.info "  ❌ Error processing layout #{layout.code || layout.id}: #{e.message}"
          stats[:errors] += 1
          Rails.logger.info "     Stack trace: #{e.backtrace.first(3).join(' <- ')}" if dry_run
        end
      end
    end

    stats
  end

  def process_layout_accordions(layout, dry_run)
    layout_stats = initialize_layout_stats
    accordion_nodes = find_accordion_nodes(layout.craftjs_json)
    return layout_stats if accordion_nodes.empty?

    layout_stats[:total_accordions] = accordion_nodes.count
    nodes_to_migrate = analyze_accordion_nodes(accordion_nodes, layout, dry_run, layout_stats)
    execute_migrations(nodes_to_migrate, layout, dry_run, layout_stats) unless dry_run

    layout_stats
  end

  def initialize_layout_stats
    {
      total_accordions: 0,
      text_based_accordions: 0,
      already_canvas_accordions: 0,
      accordions_with_content: 0,
      accordions_to_migrate: 0,
      migrated_count: 0,
      errors: 0
    }
  end

  def analyze_accordion_nodes(accordion_nodes, layout, dry_run, layout_stats)
    nodes_to_migrate = []

    accordion_nodes.each do |node_id, node|
      if node.dig('craft', 'props', 'isCanvas') == true
        handle_canvas_accordion(node_id, layout, dry_run, layout_stats)
        next
      end

      text_content = node.dig('props', 'text') || node.dig('craft', 'props', 'text')
      layout_stats[:text_based_accordions] += 1

      if text_content.present? && text_content.values.any?(&:present?)
        handle_migratable_accordion(node_id, node, text_content, layout, dry_run, layout_stats)
        nodes_to_migrate << { node_id: node_id, node: node, text_prop: text_content }
      elsif dry_run && text_content.present?
        handle_empty_accordion(node_id, layout)
      end
    end

    nodes_to_migrate
  end

  def handle_canvas_accordion(node_id, layout, dry_run, layout_stats)
    layout_stats[:already_canvas_accordions] += 1
    return unless dry_run

    Rails.logger.info "  📋 Layout: #{layout.code || layout.id}"
    Rails.logger.info "     └─ Accordion Node: #{node_id}"
    Rails.logger.info '        Already in canvas mode'
  end

  def handle_migratable_accordion(node_id, _node, text_content, layout, dry_run, layout_stats)
    layout_stats[:accordions_with_content] += 1
    layout_stats[:accordions_to_migrate] += 1
    return unless dry_run

    Rails.logger.info "  📋 Layout: #{layout.code || layout.id}"
    Rails.logger.info "     └─ Accordion Node: #{node_id}"
    Rails.logger.info '        Has text content - WOULD BE MIGRATED'
    Rails.logger.info "           Text locales: #{text_content.keys.join(', ')}"
    Rails.logger.info "           Sample text: #{text_content.values.first&.truncate(100)}"
    Rails.logger.info '           Would create TextMultiloc child component'
    Rails.logger.info '           Would create Container wrapper'
    Rails.logger.info '           Would update accordion to use linkedNodes'
    Rails.logger.info '           Would remove text property from accordion'
  end

  def handle_empty_accordion(node_id, layout)
    Rails.logger.info "  📋 Layout: #{layout.code || layout.id}"
    Rails.logger.info "     └─ Accordion Node: #{node_id}"
    Rails.logger.info '        Has empty text property - WOULD BE CLEANED UP'
    Rails.logger.info '         Would remove empty text property'
  end

  def execute_migrations(nodes_to_migrate, layout, _dry_run, layout_stats)
    return if nodes_to_migrate.empty?

    Rails.logger.info "  Processing layout: #{layout.code || layout.id}"

    nodes_to_migrate.each do |migration_data|
      migrate_accordion_node(layout, migration_data)
      layout_stats[:migrated_count] += 1
    rescue StandardError => e
      Rails.logger.info "    ❌ Error migrating accordion #{migration_data[:node_id]}: #{e.message}"
      layout_stats[:errors] += 1
    end

    save_migrated_layout(layout, layout_stats) if layout_stats[:migrated_count] > 0
  end

  def save_migrated_layout(layout, layout_stats)
    layout.save!
    Rails.logger.info "    ✅ Migrated #{layout_stats[:migrated_count]} accordion(s)"
  rescue StandardError => e
    Rails.logger.info "    ❌ Error saving layout: #{e.message}"
    layout_stats[:errors] += layout_stats[:migrated_count]
    layout_stats[:migrated_count] = 0
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

    Rails.logger.info "    Migrated accordion #{node_id} with text content"
  end
end
