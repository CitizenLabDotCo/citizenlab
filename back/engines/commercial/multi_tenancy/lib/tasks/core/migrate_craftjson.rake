# frozen_string_literal: true

MULTILOC_TYPES = {
  'Text' => 'TextMultiloc',
  'Button' => 'ButtonMultiloc',
  'Image' => 'ImageMultiloc',
  'Iframe' => 'IframeMultiloc',
  'Accordion' => 'AccordionMultiloc',
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
        structures = craftjson.values.select do |elts|
          includes_multiloc_elements? elts
        end.map do |elts|
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
end

# Potentially ignore: 
# {"resolvedName"=>"WhiteSpace"}
# Containers with no children: {"resolvedName"=>"TwoColumn"}=>[]}, 
# Trees with no text-related elements


def tree_structure(elts, current_node_id = 'ROOT')
  current_node = elts[current_node_id]
  children = current_node['nodes'].map do |child_id|
    tree_structure(elts, child_id)
  end.select do |child|
    !skip_child?(child)
  end
  { 'type' => node_type(current_node), 'children' => children }
end

def multilingual?(craftjson, locales)
  (craftjson.keys & locales).size > 1
end

def only_root_compatible?(craftjson)
  craftjson.values.select { |elts| elts.keys != ['ROOT'] }.size <= 1
end

def includes_multiloc_elements?(elts)
  elts.values.any? do |elt|
    MULTILOC_TYPES.keys.include? node_type(elt)
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




# keys_none = 0
    # keys_one = 0
    # keys_many = 0
  #   data.each do |d|
  #     craftjson = JSON.parse(d['Craftjs Jsonmultiloc'])
  #     case craftjson.keys.size
  #     when 0
  #       keys_none += 1
  #     when 1
  #       keys_one += 1
  #     else
  #       puts d['ID']
  #       keys_many += 1
  #     end
  #   end
    # puts "None: #{keys_none}"
    # puts "One: #{keys_one}"
    # puts "Many: #{keys_many}"