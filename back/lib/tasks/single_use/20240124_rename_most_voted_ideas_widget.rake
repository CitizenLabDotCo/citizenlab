# frozen_string_literal: true

namespace :single_use do
  desc 'Fix existing layouts'
  task :rename_most_voted_ideas_widget, %i[content_buildable_type] => [:environment] do |_t, args|
    # region HELPER METHODS
    def multiloc_types
      @multiloc_types ||= {
        'MostVotedIdeasWidget' => 'MostReactedIdeasWidget'
      }
    end

    def multiloc_element?(elt)
      multiloc_types.key? node_type(elt)
    end

    def node_type(elt)
      type = elt['type']
      type = type['resolvedName'] if type.is_a? Hash
      type
    end

    def migrate_monolingual(craftjs_json, primary_locale, other_locales)
      return {} if craftjs_json.blank?

      text_props = %w[text alt title]

      craftjs_json.transform_values do |elt|
        new_elt = elt.deep_dup
        if multiloc_element?(elt)
          new_elt['type']['resolvedName'] = multiloc_types[elt.dig('type', 'resolvedName')] if multiloc_types.key? elt.dig('type', 'resolvedName')
          new_elt['displayName'] = multiloc_types[elt['displayName']] if multiloc_types.key? elt['displayName']
          text_props.each do |text_prop|
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
    # endregion

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
