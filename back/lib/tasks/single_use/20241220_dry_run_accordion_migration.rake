namespace :single_use do
  desc 'Dry run: Analyze which accordions would be migrated to canvas mode'
  task dry_run_accordion_migration: :environment do
    puts 'DRY RUN: Analyzing accordion migration without making changes...'
    puts '=' * 80

    total_accordions = 0
    text_based_accordions = 0
    already_canvas_accordions = 0
    accordions_with_content = 0
    accordions_to_migrate = 0
    layouts_with_accordions = 0

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      tenant.switch do
        analyze_tenant_accordions(total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate, layouts_with_accordions)
      end
    end

    puts "\n#{'=' * 80}"
    puts '📊 MIGRATION SUMMARY (All Tenants):'
    puts "   Total accordions found: #{total_accordions}"
    puts "   Text-based accordions: #{text_based_accordions}"
    puts "   Already canvas accordions: #{already_canvas_accordions}"
    puts "   Accordions with content: #{accordions_with_content}"
    puts "   Accordions to migrate: #{accordions_to_migrate}"
    puts "   Layouts with accordions: #{layouts_with_accordions}"
    puts '=' * 80
  end

  private

  def analyze_tenant_accordions(total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate, layouts_with_accordions)
    # Debug: Check how many layouts exist
    total_layouts = ContentBuilder::Layout.count
    puts "  📊 DEBUG: Found #{total_layouts} total layouts in database"

    if total_layouts == 0
      handle_no_layouts_found
      return
    end

    # Debug: Show all layouts and their attributes
    debug_layout_attributes

    process_layouts_for_accordions(total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate, layouts_with_accordions)
  end

  def handle_no_layouts_found
    puts '  ❌ No ContentBuilder::Layout records found in database!'
    puts '   This might mean:'
    puts '   - The test data was not created properly'
    puts '   - You are looking at the wrong database'
    puts '   - The table is empty'

    # Debug: Check what tables exist
    puts "\n  🔍 Checking what tables exist in database..."
    tables = ActiveRecord::Base.connection.tables
    puts "   Total tables: #{tables.length}"
    puts "   Tables containing 'layout': #{tables.select { |t| t.include?('layout') }}"
    puts "   Tables containing 'content': #{tables.select { |t| t.include?('content') }}"

    if tables.include?('content_builder_layouts')
      puts '   ✅ content_builder_layouts table exists'
      # Check if table is empty
      count = ActiveRecord::Base.connection.execute('SELECT COUNT(*) FROM content_builder_layouts').first['count']
      puts "   📊 Records in content_builder_layouts: #{count}"
    else
      puts '   ❌ content_builder_layouts table does NOT exist'
    end

    puts "\n  💡 To create test data, run:"
    puts '   docker compose run web bundle exec rake single_use:create_test_accordions'
    puts "\n  🚀 Creating test data now..."
  end

  def debug_layout_attributes
    puts "\n  🔍 DEBUG: Examining all layouts..."
    ContentBuilder::Layout.all.each do |layout|
      puts "   Layout #{layout.id}:"
      puts "     Code: #{layout.code}"
      puts "     Content Type: #{layout.content_buildable_type}"
      puts "     Content ID: #{layout.content_buildable_id}"
      puts "     Enabled: #{layout.enabled}"
      puts "     Has craftjs_json: #{layout.respond_to?(:craftjs_json)}"
      puts "     craftjs_json present: #{layout.respond_to?(:craftjs_json) ? layout.craftjs_json.present? : 'N/A'}"
      puts "     craftjs_json type: #{layout.respond_to?(:craftjs_json) ? layout.craftjs_json.class : 'N/A'}"
      puts "     All attributes: #{layout.attributes.keys.join(', ')}"
      puts ''
    end
  end

  def process_layouts_for_accordions(total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate, layouts_with_accordions)
    ContentBuilder::Layout.find_each do |layout|
      puts "  📋 Checking Layout: #{layout.code} (ID: #{layout.id})"
      puts "     Content Type: #{layout.content_buildable_type} (ID: #{layout.content_buildable_id})"
      puts "     craftjs_json present: #{layout.craftjs_json.present?}"
      puts "     craftjs_json type: #{layout.craftjs_json.class}"
      puts "     craftjs_json keys: #{layout.craftjs_json.is_a?(Hash) ? layout.craftjs_json.keys.first(5).join(', ') : 'N/A'}"

      next if layout.craftjs_json.blank?

      accordion_nodes = find_accordion_nodes(layout.craftjs_json)
      puts "     Accordion nodes found: #{accordion_nodes.length}"
      next if accordion_nodes.empty?

      layouts_with_accordions += 1
      puts "\n  Layout: #{layout.code} (ID: #{layout.id})"
      puts "     Content Type: #{layout.content_buildable_type} (ID: #{layout.content_buildable_id})"

      process_accordion_nodes(accordion_nodes, total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate)
    end
  end

  def process_accordion_nodes(accordion_nodes, total_accordions, text_based_accordions, already_canvas_accordions, accordions_with_content, accordions_to_migrate)
    accordion_nodes.each do |node_id, node|
      total_accordions += 1
      puts "     └─ Accordion Node: #{node_id}"

      if node.dig('craft', 'props', 'isCanvas') == true
        already_canvas_accordions += 1
        puts '        Already in canvas mode'
        next
      end

      # Check for text content in the correct location
      text_content = node.dig('props', 'text') || node.dig('craft', 'props', 'text')
      text_based_accordions += 1

      if text_content.present? && text_content.values.any?(&:present?)
        accordions_with_content += 1
        accordions_to_migrate += 1

        puts '        Has text content - WOULD BE MIGRATED'
        puts "           Text locales: #{text_content.keys.join(', ')}"
        puts "           Sample text: #{text_content.values.first&.truncate(100)}"
        puts '           Would create TextMultiloc child component'
        puts '           Would create Container wrapper'
        puts '           Would update accordion to use linkedNodes'
        puts '           Would remove text property from accordion'
      else
        puts '        Has empty text property - WOULD BE CLEANED UP'
        puts '         Would remove empty text property'
      end
    end
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
end
