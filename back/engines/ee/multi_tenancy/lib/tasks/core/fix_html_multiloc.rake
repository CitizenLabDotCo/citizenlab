# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Converts all html titles h1=>h2 and h2=>h3'
  task fix_html_multiloc: [:environment] do |_t, _args|
    # All models that have a multiloc that can contain titles
    html_multilocs = {
      Area => [:description_multiloc],
      Event => [:description_multiloc],
      Idea => [:body_multiloc],
      Phase => [:description_multiloc],
      Project => [:description_multiloc],
      StaticPage => [:body_multiloc]
    }

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        puts "Processing tenant #{tenant.host}..."
        html_multilocs.each do |claz, attrs|
          attrs.each do |attr|
            claz.all.each do |instance|
              converted_multiloc = convert_multiloc(instance.send(attr))
              instance.update_columns(attr.to_sym => converted_multiloc)
            end
          end
        end
      end
    end
  end

  desc 'Resanitizes attributes that can contain HTML'
  task resanitize: [:environment] do |_t, _args|
    html_multilocs = Cl2DataListingService.new.cl2_schema_root_models.map do |claz|
      atrs = Cl2DataListingService.new.html_multiloc_attributes claz
      [claz, atrs] if atrs
    end.compact.to_h

    html_attributes = {
      **html_multilocs,
      Invite => %i[invite_text]
    }

    Tenant.creation_finalized.map do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        puts "Processing tenant #{tenant.host}..."
        html_attributes.map do |claz, atrs|
          claz.all.map do |instance|
            atrs.each do |atr|
              instance.send("sanitize_#{atr}")
              instance.update_columns(atr => instance.send(atr))
            end
          end
        end
      end
    end
  end

  desc 'Runs the TextImageService on all HTML multilocs that can have images'
  task swap_all_html_images: [:environment] do |_t, _args|
    errors = []
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              instance.send attribute
              begin
                multiloc = TextImageService.new.swap_data_images instance, attribute
                instance.send "#{attribute}=", multiloc
                instance.save!
              rescue Exception => e
                errors += [e.message]
              end
            end
          end
        end
      end
    end
    if errors.blank?
      puts 'Success!'
    else
      puts 'Some issues occured.'
      errors.each { |err| puts err }
    end
  end

  desc 'Substitutes HTML URLs by the S3 url, according to a list of requested sustitutions (tenants that changed host)'
  task :substitute_html_relative_paths, [:url] => [:environment] do |_t, args|
    tofix = JSON.parse open(args[:url]).read
    tofix.each do |host, clazzes|
      Apartment::Tenant.switch(host.tr('.', '_')) do
        clazzes.each do |claz, instances|
          instances.each do |id, attributes|
            object = claz.constantize.find id
            attributes.each do |attribute, _|
              multiloc = object.send attribute
              multiloc.each_key do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                allowed_images = doc.css('img').select do |img|
                  img.attr('src') =~ %r{^$|^((http://.+)|(https://.+))}
                end
                allowed_images.each do |img|
                  url = img.attr('src')
                  path = "#{Frontend::UrlService.new.home_url}/uploads/#{url.partition('/uploads/').last}"
                  img.set_attribute('src', path)
                end
                multiloc[k] = doc.to_s
              end
              multiloc = TextImageService.new.swap_data_images object, attribute
              object.send "#{attribute}=", multiloc
              object.save!
            end
          end
        end
      end
    end
  end

  desc 'List HTML URLs not starting with home URL to be fixed'
  task list_html_links_to_fix_not_home: [:environment] do |_t, _args|
    results = {}
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc&.keys&.each do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                allowed_images = doc.css('img').select do |img|
                  (img.attr('src') =~ %r{^$|^((http://.+)|(https://.+))} &&
                    img.attr('src').exclude?("#{tenant.host}/uploads/") &&
                    img.attr('src').exclude?('s3.amazonaws.com') &&
                    img.attr('src').exclude?('res.cloudinary.com')
                  )
                end
                allowed_images.each do |img|
                  results[tenant.host] ||= {}
                  results[tenant.host][claz.name] ||= {}
                  results[tenant.host][claz.name][instance.id] ||= {}
                  results[tenant.host][claz.name][instance.id][attribute] ||= []
                  results[tenant.host][claz.name][instance.id][attribute] += [img.attr('src')]
                end
              end
            end
          end
        end
      end
    end
    puts JSON.pretty_generate(results)
  end

  desc 'Lists all bad URLs across all multilocs that can contain images for all tenants'
  task bad_multiloc_urls: :environment do
    results = {}
    regex = %r{https?://[^ "']+[^a-zA-Z0-9\-._/][^ "']*\.[a-zA-Z0-9]+}
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc.each_value do |value|
                value.scan(regex).each do |match|
                  results[tenant.host] ||= {}
                  results[tenant.host][claz.name] ||= {}
                  results[tenant.host][claz.name][instance.id] ||= {}
                  results[tenant.host][claz.name][instance.id][attribute] ||= []
                  results[tenant.host][claz.name][instance.id][attribute] += [match]
                end
              end
            end
          end
        end
      end
    end
    puts JSON.pretty_generate(results)
  end

  desc 'Replace all bad URLs according to the given mapping across all multilocs that can contain images for all tenants'
  task :replace_multiloc_urls, [:url] => [:environment] do |_t, args|
    mapping = JSON.parse open(args[:url]).read
    results = {}
    errors = []
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        count = 0
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              changed = false
              multiloc = instance.send attribute
              multiloc.each_value do |value|
                mapping.each do |url_from, url_to|
                  value.gsub!(url_from) do |_|
                    changed = true
                    count += 1
                    url_to
                  end
                end
              end
              next unless changed

              instance.update_column(attribute, multiloc)
              begin
                multiloc = TextImageService.new.swap_data_images instance, attribute
                instance.send "#{attribute}=", multiloc
                instance.save!
              rescue Exception => e
                errors += [e.message]
              end
            end
          end
        end
        results[tenant.host] = count
      end
    end
    puts JSON.pretty_generate(results)
    if errors.blank?
      puts 'Success!'
    else
      puts 'Some issues occured.'
      errors.each { |err| puts err }
    end
  end
end

def convert_multiloc(multiloc)
  multiloc.each do |locale, html|
    multiloc[locale] = convert_html(html)
  end
end

def convert_html(html)
  doc = Nokogiri::HTML.fragment(html)
  doc.css('h2').each do |node|
    node.name = 'h3'
  end
  doc.css('h1').each do |node|
    node.name = 'h2'
  end
  doc.to_s
end

def imageable_html_multilocs
  {
    Event => [:description_multiloc],
    Initiative => [:body_multiloc],
    StaticPage => [:body_multiloc],
    Phase => [:description_multiloc],
    Project => [:description_multiloc],
    ProjectFolders::Folder => [:description_multiloc],
    EmailCampaigns::Campaign => [:body_multiloc],
    AppConfiguration => [:homepage_info_multiloc]
  }
end
