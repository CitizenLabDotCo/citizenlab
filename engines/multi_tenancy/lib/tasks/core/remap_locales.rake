
namespace :fix_existing_tenants do
  
  desc "Update tenant settings locales to use the new locale keys"
  task :remap_tenant_locales, [:dry_run] => [:environment] do |t, args|

    Rails.application.eager_load!

    generic_locale_mapping = generate_generic_locale_mapping

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do

        DRY_RUN = !!args[:dry_run]

        tenant = Tenant.current
        loc_map = locales_map_for_tenant(generic_locale_mapping, tenant)
        puts "#{tenant.name} --- locale mapping #{loc_map}"

        # *** Update the locales in the tenant settings
        tenant.settings['core']['locales'] = tenant.settings['core']['locales'].map do |old_locale|
          loc_map[old_locale]
        end
        if tenant.settings['core']['organization_name']
          tenant.settings['core']['organization_name'] = multiloc_transform(tenant.settings['core']['organization_name'], loc_map)
        end
        if tenant.settings['core']['header_title']
          tenant.settings['core']['header_title'] = multiloc_transform(tenant.settings['core']['header_title'], loc_map)
        end
        if tenant.settings['core']['header_slogan']
          tenant.settings['core']['header_slogan'] = multiloc_transform(tenant.settings['core']['header_slogan'], loc_map)
        end
        if tenant.settings['core']['meta_title']
          tenant.settings['core']['meta_title'] = multiloc_transform(tenant.settings['core']['meta_title'], loc_map)
        end
        if tenant.settings['core']['meta_description']
          tenant.settings['core']['meta_description'] = multiloc_transform(tenant.settings['core']['meta_description'], loc_map)
        end

        tenant.save unless DRY_RUN
        puts "#{tenant.name} --- tenant locales changed to #{tenant.settings['core']['locales']}"

        # *** Update all multiloc fields
        ApplicationRecord.descendants.each do |klass|
          next if ["PgSearch::Document", "Apartment::Adapters::AbstractAdapter::SeparateDbConnectionHandler"].include? klass.name
          klass.column_names.select{|c| c=~/.*_multiloc$/}.each do |multiloc_column|
            klass.all.each do |instance|
              original = instance.send(multiloc_column)
              transformed = multiloc_transform(original, loc_map)
              instance.update_columns(multiloc_column => transformed) unless DRY_RUN
              puts "#{tenant.name} --- #{klass.name} #{instance.id} #{multiloc_column} converted to #{transformed.map{|k,v| [k, v&.truncate(7)]}.to_h}"
            end
          end
        end

        # *** Update all user locales
        User.all.each do |user|
          old_locale = user.locale
          new_locale = loc_map[user.locale]
          user.update_columns(locale: loc_map[user.locale]) unless DRY_RUN
          puts "#{tenant.name} --- User #{user.id} locale changed from #{old_locale} to #{new_locale}"
        end


      end
    end
  end


  desc "Show which tenants don't have a custom location"
  task :detect_locationless_tenants => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      if tenant.settings.dig('maps', 'map_center', 'lat') == '50.8503'
        puts "*** Needs custom map center:  #{tenant.name}"
      else
        puts "--- Has custom map center: #{tenant.name}"
      end
    end
  end


end

def generate_generic_locale_mapping

  # countries = RGeo::GeoJSON.decode(File.read("#{File.dirname(__FILE__)}/countries.geojson"))
  countries = RGeo::GeoJSON.decode(open('https://s3.eu-central-1.amazonaws.com/cl2-config/countries.geojson'){ |f| f.read })

  geo_be = countries.find{|c| c.properties["ISO_A3"] == "BEL"}
  geo_nl = countries.find{|c| c.properties["ISO_A3"] == "NLD"}
  geo_fr = countries.find{|c| c.properties["ISO_A3"] == "FRA"}
  geo_gb = countries.find{|c| c.properties["ISO_A3"] == "GBR"}
  geo_ca = countries.find{|c| c.properties["ISO_A3"] == "CAN"}

  {
    'en' => {
      'geo_mapping' => {
        geo_gb => 'en-GB',
        geo_ca => 'en-CA',
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
    'en-GB' => {
      'fallback' => 'en-GB'
    },
    'en-CA' => {
      'fallback' => 'en-CA'
    },
    'nl-BE' => {
      'fallback' => 'nl-BE'
    },
    'nl-NL' => {
      'fallback' => 'nl-NL'
    },
    'fr-BE' => {
      'fallback' => 'fr-BE'
    },
    'fr-FR' => {
      'fallback' => 'fr-FR'
    },
    'de-DE' => {
      'fallback' => 'de-DE'
    },
    'da-DK' => {
      'fallback' => 'da-DK'
    },
    'nb-NO' => {
      'fallback' => 'nb-NO'
    }
  }
end



def old_to_new_locale generic_mapping, old_locale, tenant_location
  generic_mapping[old_locale]['geo_mapping']&.find do |geo, locale|
    geo.geometry.contains?(tenant_location)
  end&.second || generic_mapping[old_locale]['fallback']
end

def locales_map_for_tenant generic_mapping, tenant
  generic_mapping.keys.map do |old_locale|
    [old_locale, old_to_new_locale(generic_mapping, old_locale, tenant.location)]
  end.to_h
end

def multiloc_transform multiloc, mapping
  multiloc&.each_with_object({}) do |(old_locale, value), object|
    object[mapping[old_locale]] = value
  end
end
