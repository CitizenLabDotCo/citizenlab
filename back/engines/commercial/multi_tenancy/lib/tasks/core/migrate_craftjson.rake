# frozen_string_literal: true

MULTILOC_TYPES = {
  'Text' => 'TextMultiloc',
  'Button' => 'ButtonMultiloc',
  'Image' => 'ImageMultiloc',
  'Iframe' => 'IframeMultiloc',
  'Accordion' => 'AccordionMultiloc'
}
CONTAINER_TYPES = %w[TwoColumn Container ThreeColumn]

namespace :migrate_craftjson do
  desc 'Analyze'
  task :analyze, %i[file] => [:environment] do |_t, args|
    filename = args[:file] || 'craftjsons.csv'
    data = CSV.parse(open(filename).read, { headers: true, col_sep: ',', converters: [] })
    good = 0
    bad = 0
    data.each do |d|
      craftjson = JSON.parse(d['Craftjs Jsonmultiloc'])
      locales = JSON.parse(d['Core Locales'])
      if multilingual?(craftjson, locales)
        layouts = craftjson.values.select do |elts|
          includes_multiloc_elements? elts
        end
        structure = layouts.map do |elts|
          tree_structure elts
        end
        if structures.uniq.size > 1
          puts d['Content Buildable ID']
          bad += 1
        else
          good += 1
        end
      end
    end
    puts "Good: #{good}"
    puts "Baad: #{bad}"
  end

  desc 'Verify project'
  task :verify_project, %i[host project_slug] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host]
    Apartment::Tenant.switch(tenant.schema_name) do
      project = Project.find_by slug: args[:project_slug]
      craftjs_jsonmultiloc = project.content_builder_layouts.first.craftjs_jsonmultiloc
      structures = craftjs_jsonmultiloc.values.map do |elts|
        tree_structure elts
      end

      if structures.uniq.size > 1
        puts 'Incompatible structures :('
      else
        puts 'Compatible structures :)'
      end
    end
  end
end

def tree_structure(elts, current_node_id = 'ROOT')
  current_node = elts[current_node_id]
  children = current_node['nodes'].map do |child_id|
    tree_structure(elts, child_id)
  end
  children.reject do |child|
    skip_child?(child)
  end
  { 'type' => node_type(current_node), 'children' => children }
end

def multilingual?(craftjson, locales)
  (craftjson.keys & locales).size > 1
end

def only_root_compatible?(craftjson)
  craftjson.values.count { |elts| elts.keys != ['ROOT'] } <= 1
end

def includes_multiloc_elements?(elts)
  elts.values.any? do |elt|
    MULTILOC_TYPES.key? node_type(elt)
  end
end

def node_type(elt)
  type = elt['type']
  type = type['resolvedName'] if type.is_a? Hash
  type
end

def skip_child?(child)
  child['type'] == 'WhiteSpace' || (CONTAINER_TYPES.include?(child['type']) && child['children'].empty?)
end
