# frozen_string_literal: true

MULTILOC_TYPES = {
  'Text' => 'TextMultiloc',
  'Button' => 'ButtonMultiloc',
  'Image' => 'ImageMultiloc',
  'Iframe' => 'IframeMultiloc',
  'Accordion' => 'AccordionMultiloc',
  # Report builder components:
  'Title' => 'TitleMultiloc',
  'SurveyResultsWidget' => 'SurveyResultsWidget',
  'MostReactedIdeasWidget' => 'MostReactedIdeasWidget',
  'MostVotedIdeas' => 'MostReactedIdeasWidget',
  'ReactionsByTimeWidget' => 'ReactionsByTimeWidget',
  'VotesByTimeWidget' => 'ReactionsByTimeWidget',
  'CommentsByTimeWidget' => 'CommentsByTimeWidget',
  'VisitorsWidget' => 'VisitorsWidget',
  'VisitorsTrafficSourcesWidget' => 'VisitorsTrafficSourcesWidget',
  'PostsByTimeWidget' => 'PostsByTimeWidget',
  'ActiveUsersWidget' => 'ActiveUsersWidget',
  'GenderWidget' => 'GenderWidget',
  'AgeWidget' => 'AgeWidget'
}
TEXT_PROPS = %w[text alt title]
CONTAINER_TYPES = %w[TwoColumn Container ThreeColumn]

namespace :migrate_craftjson do
  desc 'Analyze'
  task :analyze, %i[file] => [:environment] do |_t, args|
    filename = args[:file] || 'craftjsons.csv'
    data = CSV.parse(open(filename).read, headers: true, col_sep: ',', converters: [])
    good = 0
    bad = 0
    data.each do |d|
      craftjson = JSON.parse(d['Craftjs Jsonmultiloc'])
      locales = JSON.parse(d['Core Locales'])
      if multilingual?(craftjson, locales)
        layouts = craftjson.values.select do |elts|
          includes_multiloc_elements? elts
        end
        structures = layouts.map do |elts|
          tree_structure elts
        end
        if structures.uniq.size > 1
          Rails.logger.info d['Content Buildable ID']
          bad += 1
        else
          good += 1
        end
      end
    end
    Rails.logger.info "Good: #{good}"
    Rails.logger.info "Baad: #{bad}"
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
        Rails.logger.info 'Incompatible structures :('
      else
        Rails.logger.info 'Compatible structures :)'
      end
    end
  end

  desc 'Fix existing layouts'
  task :fix_layouts, %i[content_buildable_type] => [:environment] do |_t, args|
    errors = {}
    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      Rails.logger.info tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        locales = AppConfiguration.instance.settings.dig('core', 'locales')
        layouts = if args[:content_buildable_type]
          ContentBuilder::Layout.where(content_buildable_type: args[:content_buildable_type])
        else
          ContentBuilder::Layout.all
        end
        layouts.each do |layout|
          Rails.logger.info layout.id
          primary_locale = layout.craftjs_jsonmultiloc[locales.first].present? ? locales.first : layout.craftjs_jsonmultiloc.keys.first
          other_locales = locales - [primary_locale]
          layout.craftjs_json = migrate_monolingual(layout.craftjs_jsonmultiloc, primary_locale, other_locales)
          if multilingual?(layout.craftjs_jsonmultiloc, locales)
            structures = layout.craftjs_jsonmultiloc.values.map do |elts|
              tree_structure elts
            end
            if structures.uniq.size > 1
              errors[tenant.host] ||= []
              errors[tenant.host] += ["#{layout.id}: Incompatible structures"]
            else
              add_multilocs(layout, primary_locale, other_locales)
            end
          end
          if !layout.save
            errors[tenant.host] ||= []
            errors[tenant.host] += ["#{layout.id}: #{layout.errors.details}"]
          end
        end
      end
    end

    if errors.present?
      Rails.logger.info 'Some errors occurred!'
      pp errors
    else
      Rails.logger.info 'Success!'
    end
  end
end

def tree_structure(elts, current_node_id = 'ROOT')
  current_node = elts[current_node_id]
  children = child_ids(current_node).map do |child_id|
    tree_structure(elts, child_id)
  end
  children.reject do |child|
    skip_child?(child)
  end
  { 'type' => node_type(current_node), 'children' => children }
end

def child_ids(elt)
  ids = elt['nodes'] || []
  ids += elt['linkedNodes'].sort.map(&:last) if elt.key? 'linkedNodes'
  ids
end

def multilingual?(craftjson, locales)
  (craftjson.keys & locales).size > 1
end

def includes_multiloc_elements?(elts)
  elts.values.any? do |elt|
    multiloc_element?(elt)
  end
end

def multiloc_element?(elt)
  MULTILOC_TYPES.key? node_type(elt)
end

def node_type(elt)
  type = elt['type']
  type = type['resolvedName'] if type.is_a? Hash
  type
end

def skip_child?(child)
  node_type(child) == 'WhiteSpace' || (CONTAINER_TYPES.include?(node_type(child)) && child_ids(child).empty?)
end

def migrate_monolingual(craftjs_jsonmultiloc, primary_locale, other_locales)
  return {} if craftjs_jsonmultiloc.blank?

  craftjs_jsonmultiloc[primary_locale].transform_values do |elt|
    new_elt = elt.deep_dup
    if multiloc_element?(elt)
      new_elt['type']['resolvedName'] = MULTILOC_TYPES[elt.dig('type', 'resolvedName')] if MULTILOC_TYPES.key? elt.dig('type', 'resolvedName')
      new_elt['displayName'] = MULTILOC_TYPES[elt['displayName']] if MULTILOC_TYPES.key? elt['displayName']
      if new_elt['type']['resolvedName'] == 'ImageMultiloc'
        image_prop = {}
        image_prop['dataCode'] = new_elt.dig('props', 'dataCode') if new_elt.dig('props', 'dataCode')
        new_elt['props']['image'] = image_prop
        new_elt['props'].delete 'dataCode'
      end
      TEXT_PROPS.each do |text_prop|
        if elt['props'].key? text_prop
          new_elt['props'][text_prop] = { primary_locale => elt.dig('props', text_prop) }
          other_locales.each do |other_locale|
            new_elt['props'][text_prop][other_locale] = ''
          end
        end
      end
    end
    new_elt
  end
end

def add_multilocs(layout, primary_locale, other_locales)
  mapping = text_mapping(layout.craftjs_jsonmultiloc, primary_locale)

  layout.craftjs_json.transform_values do |elt|
    if MULTILOC_TYPES.value? node_type(elt)
      TEXT_PROPS.each do |text_prop|
        if elt['props'].key? text_prop
          primary_text = elt.dig('props', text_prop, primary_locale)
          other_locales.each do |other_locale|
            elt['props'][text_prop][other_locale] = mapping.dig(primary_text, other_locale) if mapping.dig(primary_text, other_locale)
          end
        end
      end
    else
      elt
    end
  end
end

def text_mapping(craftjs_jsonmultiloc, primary_locale, current_nodes = nil)
  # Initialize
  mapping = {}
  current_nodes ||= craftjs_jsonmultiloc.transform_values { |elts| elts['ROOT'] }

  # Add to mapping for current nodes if text
  TEXT_PROPS.each do |text_prop|
    primary_elt = current_nodes[primary_locale]
    if primary_elt['props'].key? text_prop
      primary_text = primary_elt.dig('props', text_prop)
      mapping[primary_text] ||= {}
      current_nodes.each do |other_locale, other_elt|
        mapping[primary_text][other_locale] = other_elt.dig('props', text_prop) if primary_locale != other_locale
      end
    end
  end

  # Loop over children
  children = current_nodes.to_h do |locale, elt|
    elt_children = child_ids(elt).filter_map do |child_id|
      child = craftjs_jsonmultiloc[locale][child_id]
      skip_child?(child) ? nil : child
    end
    [locale, elt_children]
  end
  return mapping if children.values.map(&:size).uniq.size > 1 # Incompatible structures

  (0...children[primary_locale].size).each do |i|
    child_nodes = children.transform_values do |elt_children|
      elt_children[i]
    end
    mapping.merge!(text_mapping(craftjs_jsonmultiloc, primary_locale, child_nodes))
  end
  mapping.delete ''
  mapping
end
