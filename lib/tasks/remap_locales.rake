
namespace :fix_existing_tenants do
  
  desc "Update tenant settings locales to use the new locale keys"
  task :remap_tenant_locales => [:environment] do |t, args|

    Rails.application.eager_load!

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do


        tenant = Tenant.current
        loc_map = locales_map_for_tenant(Tenant.current)

        puts "Locale mapping for #{tenant.name}: #{loc_map}"

        # *** Update the locales in the tenant settings
        tenant.settings['core']['locales'] = tenant.settings['core']['locales'].map do |old_locale|
          loc_map[old_locale]
        end

        # *** Update all multiloc fields
        ApplicationRecord.descendants.each do |klass|
          next if ["PgSearch::Document", "Apartment::Adapters::AbstractAdapter::SeparateDbConnectionHandler"].include? klass.name
          klass.column_names.select{|c| c=~/.*_multiloc$/}.each do |multiloc_column|
            puts [klass.name.upcase, multiloc_column]
            klass.all.each do |instance|
              original = instance.send(multiloc_column)
              puts "Original #{original}"
              transformed = multiloc_transform(original, loc_map)
              puts "Tranform #{transformed}"
              # instance.update_columns(multiloc_column => transformed)
            end
          end
        end

        # *** Update all user locales
        User.all.each do |user|
          puts "#{user.locale} => #{loc_map[user.locale]}"
          # user.update_columns(locale: loc_map[user.locale])
        end

        # tenant.save

      end
    end
  end


end

OLD_LOCALES = ['en', 'nl' , 'fr', 'de', 'no', 'da']

countries = RGeo::GeoJSON.decode(File.read("#{File.dirname(__FILE__)}/countries.geojson"))

geo_be = countries.find{|c| c.properties["ISO_A3"] == "BEL"}
geo_nl = countries.find{|c| c.properties["ISO_A3"] == "NLD"}
geo_fr = countries.find{|c| c.properties["ISO_A3"] == "FRA"}
geo_gb = countries.find{|c| c.properties["ISO_A3"] == "GBR"}
geo_ca = countries.find{|c| c.properties["ISO_A3"] == "CAN"}

MAPPING = {
  'en' => {
    'geo_mapping' => {
      geo_gb => 'en-GB',
      geo_ca => 'nl-CA',
    },
    'fallback' => 'en'
  },
  'nl' => {
    'geo_mapping' => {
      geo_be => 'nl-BE',
      geo_nl => 'nl-NL',
    },
    'fallback' => 'nl-BE'
  },
  'fr' => {
    'geo_mapping' => {
      geo_be => 'fr-BE',
      geo_fr => 'fr-FR',
    },
    'fallback' => 'fr-BE'
  },
  'de' => {
    'fallback' => 'de-DE'
  },
  'da' => {
    'fallback' => 'da-DK'
  },
  'no' => {
    'fallback' => 'nb-NO'
  },
}


def old_to_new_locale old_locale, tenant_location
  MAPPING[old_locale]['geo_mapping']&.find do |geo, locale|
    geo.geometry.contains?(tenant_location)
  end&.second || MAPPING[old_locale]['fallback']
end

def locales_map_for_tenant tenant
  OLD_LOCALES.map do |old_locale|
    [old_locale, old_to_new_locale(old_locale, tenant.location)]
  end.to_h
end

def multiloc_transform multiloc, mapping
  multiloc.each_with_object({}) do |(old_locale, value), object|
    object[mapping[old_locale]] = value
  end
end
