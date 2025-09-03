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

    ContentBuilder::Layout.find_each do |layout|
      next if layout.craftjs_json.blank?

      accordion_nodes = find_accordion_nodes(layout.craftjs_json)
      next if accordion_nodes.empty?

      layouts_with_accordions += 1
      puts "\nLayout: #{layout.code} (ID: #{layout.id})"
      puts "   Content Type: #{layout.content_buildable_type} (ID: #{layout.content_buildable_id})"

      accordion_nodes.each do |node_id, node|
        total_accordions += 1
        puts "   └─ Accordion Node: #{node_id}"

        if node.dig('craft', 'props', 'isCanvas') == true
          already_canvas_accordions += 1
          puts '      Already in canvas mode'
          next
        end

        text_content = node.dig('craft', 'props', 'text')
        text_based_accordions += 1

        if text_content.present? && text_content.values.any?(&:present?)
          accordions_with_content += 1
          accordions_to_migrate += 1

          puts '      Has text content - WOULD BE MIGRATED'
          puts "         Text locales: #{text_content.keys.join(', ')}"
          puts "         Sample text: #{text_content.values.first&.truncate(100)}"
          puts '         Would create TextMultiloc child component'
          puts '         Would set isCanvas: true'
          puts '         Would remove text property'
        else
          puts '      No text content - already empty canvas'
        end
      end
    end

    puts "\n" + '=' * 80
    puts 'MIGRATION ANALYSIS SUMMARY'
    puts '=' * 80
    puts "Total layouts with accordions: #{layouts_with_accordions}"
    puts "Total accordion components: #{total_accordions}"
    puts "Text-based accordions: #{text_based_accordions}"
    puts "Already canvas accordions: #{already_canvas_accordions}"
    puts "Accordions with content: #{accordions_with_content}"
    puts "Accordions to migrate: #{accordions_to_migrate}"
    puts '=' * 80

    if accordions_to_migrate > 0
      puts "READY TO MIGRATE: #{accordions_to_migrate} accordions would be converted to canvas mode"
      puts 'Run: docker compose run web bundle exec rake single_use:migrate_accordion_to_canvas'
    else
      puts 'NO MIGRATION NEEDED: All accordions are already in canvas mode or empty'
    end

    puts "\nThis was a DRY RUN - no changes were made to the database."
  end

  private

  def find_accordion_nodes(craftjs_json)
    accordion_nodes = {}
    craftjs_json.each do |node_id, node|
      next unless node.is_a?(Hash)
      next unless node['type'] == 'AccordionMultiloc'
      accordion_nodes[node_id] = node
    end
    accordion_nodes
  end
end
