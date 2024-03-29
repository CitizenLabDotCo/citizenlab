# frozen_string_literal: true

MULTILOC_TYPES = {
  'MostVotedIdeasWidget' => 'MostReactedIdeasWidget'
}
TEXT_PROPS = %w[text alt title]

namespace :single_use do
  desc 'Fix existing layouts'
  task :rename_most_voted_ideas_widget, %i[content_buildable_type] => [:environment] do |_t, args|
    errors = {}
    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      Rails.logger.info tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        locales = AppConfiguration.instance.settings.dig('core', 'locales')
        layouts = ContentBuilder::Layout.where(content_buildable_type: args[:content_buildable_type])
        layouts.each do |layout|
          Rails.logger.info layout.id
          primary_locale = locales.first
          other_locales = locales - [primary_locale]
          layout.craftjs_json = migrate_monolingual(layout.craftjs_json, primary_locale, other_locales)
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

def multiloc_element?(elt)
  MULTILOC_TYPES.key? node_type(elt)
end

def node_type(elt)
  type = elt['type']
  type = type['resolvedName'] if type.is_a? Hash
  type
end

def migrate_monolingual(craftjs_json, primary_locale, other_locales)
  return {} if craftjs_json.blank?

  craftjs_json.transform_values do |elt|
    new_elt = elt.deep_dup
    if multiloc_element?(elt)
      new_elt['type']['resolvedName'] = MULTILOC_TYPES[elt.dig('type', 'resolvedName')] if MULTILOC_TYPES.key? elt.dig('type', 'resolvedName')
      new_elt['displayName'] = MULTILOC_TYPES[elt['displayName']] if MULTILOC_TYPES.key? elt['displayName']
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
