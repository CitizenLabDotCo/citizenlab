# frozen_string_literal: true

class AccordionStructureRepair
  def initialize(dry_run: false)
    @dry_run = dry_run
    @stats = {
      total_accordions: 0,
      broken_accordions: 0,
      fixed_accordions: 0,
      layouts_affected: 0,
      tenants_affected: 0
    }
  end

  def run(target_tenant = nil)
    tenants = target_tenant ? [Tenant.find_by!(host: target_tenant)] : Tenant.all
    log_start_message

    tenants.each do |tenant|
      log_info "🏢 Processing tenant: #{tenant.host}"
      tenant_stats = process_tenant(tenant)
      @stats[:tenants_affected] += 1 if tenant_stats[:layouts_affected].positive?
    end

    log_summary
    @stats
  end

  private

  def process_tenant(tenant)
    tenant_stats = {
      total_accordions: 0,
      broken_accordions: 0,
      fixed_accordions: 0,
      layouts_affected: 0
    }

    tenant.switch do
      process_layouts(tenant_stats)
    end

    tenant_stats
  end

  def process_layouts(tenant_stats)
    ContentBuilder::Layout.find_each do |layout|
      next unless layout.craftjs_json.is_a?(Hash)

      layout_stats = process_layout(layout)
      next if layout_stats[:broken_accordions].zero?

      update_stats(layout_stats)
      update_tenant_stats(tenant_stats, layout_stats)
    end
  end

  def process_layout(layout)
    stats = { total_accordions: 0, broken_accordions: 0, fixed_accordions: 0 }
    accordion_nodes = find_accordion_nodes(layout.craftjs_json)
    return stats if accordion_nodes.empty?

    stats[:total_accordions] = accordion_nodes.count
    broken_accordions = find_broken_accordions(accordion_nodes)
    return stats if broken_accordions.empty?

    stats[:broken_accordions] = broken_accordions.count
    log_info "  📋 Layout: #{layout.code || layout.id}"
    log_info "     Found #{broken_accordions.count} broken accordion(s)"

    return stats if @dry_run

    # Create backup before fixing
    create_backup(layout)

    fix_broken_accordions(layout, broken_accordions, stats)
    layout.save! if stats[:fixed_accordions].positive?
    stats
  end

  def create_backup(layout)
    backup = layout.dup
    backup.code = "backup/#{layout.code}/#{layout.id}"
    backup.content_buildable = nil
    backup.craftjs_json = layout.craftjs_json.deep_dup
    backup.save!
  end

  def find_accordion_nodes(craftjs_json)
    craftjs_json.select do |_, node|
      next false unless node.is_a?(Hash)
      next false unless node['type'].is_a?(Hash)

      node['type']['resolvedName'] == 'AccordionMultiloc'
    end
  end

  def find_broken_accordions(accordion_nodes)
    accordion_nodes.select do |_, node|
      # Check for broken Type A accordions (missing or empty linkedNodes)
      if node['isCanvas'] == true
        node['linkedNodes'].blank?
      # Check for Type B accordions that need migration
      else
        node.dig('props', 'text').present?
      end
    end
  end

  def fix_broken_accordions(layout, broken_accordions, stats)
    broken_accordions.each_key do |node_id|
      node = layout.craftjs_json[node_id]
      if fix_accordion_node(layout, node_id, node)
        stats[:fixed_accordions] += 1
        log_info "    ✅ Fixed accordion: #{node_id}"
      end
    end
  end

  def fix_accordion_node(layout, node_id, node)
    # For Type A accordions with missing linkedNodes
    if node['isCanvas'] == true
      fix_type_a_accordion(layout, node_id, node)
    # For Type B accordions with text property
    elsif node.dig('props', 'text').present?
      fix_type_b_accordion(layout, node_id, node)
    end

    true
  rescue StandardError => e
    log_info "    ❌ Error fixing accordion #{node_id}: #{e.message}"
    false
  end

  def fix_type_a_accordion(layout, node_id, node)
    container_node_id = "#{node_id}_container"
    text_node_id = "#{node_id}_text"

    # Create container node
    container_node = create_container_node(node_id)
    text_node = create_text_node(container_node_id, node)

    # Add nodes to layout
    layout.craftjs_json[container_node_id] = container_node
    layout.craftjs_json[text_node_id] = text_node

    # Update container and accordion
    container_node['nodes'] = [text_node_id]
    node['isCanvas'] = false
    node['linkedNodes'] = { 'accordion-content' => container_node_id }
    node['custom'] ||= {}
    node['custom']['hasChildren'] = true
  end

  def fix_type_b_accordion(layout, node_id, node)
    text_content = node['props']['text']
    return false unless text_content.is_a?(Hash) && text_content.values.any?(&:present?)

    container_node_id = "#{node_id}_container"
    text_node_id = "#{node_id}_text"

    # Create nodes
    container_node = create_container_node(node_id)
    text_node = create_text_node(container_node_id, node, text_content)

    # Add nodes to layout
    layout.craftjs_json[container_node_id] = container_node
    layout.craftjs_json[text_node_id] = text_node

    # Update container and accordion
    container_node['nodes'] = [text_node_id]
    node['isCanvas'] = false
    node['linkedNodes'] = { 'accordion-content' => container_node_id }
    node['custom'] ||= {}
    node['custom']['hasChildren'] = true
    node['props'].delete('text')
  end

  def create_container_node(parent_id)
    {
      'type' => { 'resolvedName' => 'Container' },
      'props' => {},
      'nodes' => [],
      'custom' => {},
      'isCanvas' => true,
      'hidden' => false,
      'linkedNodes' => {},
      'parent' => parent_id
    }
  end

  def create_text_node(parent_id, node, text_content = nil)
    {
      'type' => { 'resolvedName' => 'TextMultiloc' },
      'props' => {
        'text' => text_content || {
          'es-CL' => "Contenido del acordeón - #{node.dig('props', 'title', 'es-CL') || 'Sin título'}"
        }
      },
      'nodes' => [],
      'custom' => {},
      'isCanvas' => false,
      'hidden' => false,
      'linkedNodes' => {},
      'parent' => parent_id
    }
  end

  def update_stats(layout_stats)
    @stats[:total_accordions] += layout_stats[:total_accordions]
    @stats[:broken_accordions] += layout_stats[:broken_accordions]
    @stats[:fixed_accordions] += layout_stats[:fixed_accordions]
    @stats[:layouts_affected] += 1
  end

  def update_tenant_stats(tenant_stats, layout_stats)
    tenant_stats[:total_accordions] += layout_stats[:total_accordions]
    tenant_stats[:broken_accordions] += layout_stats[:broken_accordions]
    tenant_stats[:fixed_accordions] += layout_stats[:fixed_accordions]
    tenant_stats[:layouts_affected] += 1
  end

  def log_start_message
    if @dry_run
      log_info '🔍 DRY RUN MODE: Analyzing broken accordions without making any changes...'
    else
      log_info '🚀 REPAIR MODE: Starting repair of broken accordions...'
    end
    log_info '=' * 80
  end

  def log_summary
    log_info "\n#{'=' * 80}"
    log_info '📊 REPAIR SUMMARY:'
    log_info "   Total accordions analyzed: #{@stats[:total_accordions]}"
    log_info "   Broken accordions found: #{@stats[:broken_accordions]}"
    log_info "   Layouts affected: #{@stats[:layouts_affected]}"
    log_info "   Tenants affected: #{@stats[:tenants_affected]}"
    if @dry_run
      log_info "   Accordions that would be fixed: #{@stats[:broken_accordions]}"
    else
      log_info "   Accordions fixed: #{@stats[:fixed_accordions]}"
    end
  end

  def log_info(message)
    Rails.logger.info message
  end
end