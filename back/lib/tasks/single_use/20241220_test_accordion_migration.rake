# frozen_string_literal: true

namespace :single_use do
  desc 'Test accordion migration: analyze existing accordions and migration impact'

  task test_accordion_migration: :environment do
    puts 'Starting accordion migration analysis...'

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      analyze_accordions_for_tenant(tenant)
    end

    puts "\nAccordion migration analysis completed!"
  end

  private

  def analyze_accordions_for_tenant(tenant)
    tenant.switch do
      # Find all ContentBuilder::Layout records
      layouts = ContentBuilder::Layout.all

      total_accordions = 0
      text_based_accordions = 0
      canvas_accordions = 0
      accordions_with_content = 0

      layouts.each do |layout|
        next unless layout.craftjs_json.is_a?(Hash)

        puts "  Analyzing layout: #{layout.code || layout.id}"

        layout.craftjs_json.each_value do |node|
          next unless node.is_a?(Hash)
          next unless node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc'

          total_accordions += 1

          # Check if accordion has text content
          text_prop = node['props']&.dig('text')
          if text_prop.is_a?(Hash) && text_prop.values.any?(&:present?)
            accordions_with_content += 1
          end

          # Check if accordion is in canvas mode
          if node['isCanvas'] == true
            canvas_accordions += 1
            puts "    Found canvas accordion with #{node['nodes']&.length || 0} children"
          else
            text_based_accordions += 1
            if text_prop.is_a?(Hash) && text_prop.values.any?(&:present?)
              sample_content = text_prop.values.first&.truncate(100)
              puts "    Found text-based accordion with content: #{sample_content}"
            else
              puts '    Found text-based accordion with no content'
            end
          end
        end
      end

      # Print summary for this tenant
      puts "\n  Summary for #{tenant.host}:"
      puts "    Total accordions: #{total_accordions}"
      puts "    Text-based accordions: #{text_based_accordions}"
      puts "    Canvas accordions: #{canvas_accordions}"
      puts "    Accordions with content: #{accordions_with_content}"
      puts "    Accordions that would be migrated: #{text_based_accordions}"

      if text_based_accordions > 0
        puts "    Migration impact: #{text_based_accordions} accordion(s) would be converted to canvas mode"
      else
        puts '    Migration impact: No accordions need migration'
      end
    end
  end
end
