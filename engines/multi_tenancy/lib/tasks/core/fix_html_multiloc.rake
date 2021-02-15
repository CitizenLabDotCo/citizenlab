
namespace :fix_existing_tenants do
  desc "Converts all html titles h1=>h2 and h2=>h3"
  task :fix_html_multiloc => [:environment] do |t, args|

    # All models that have a multiloc that can contain titles
    html_multilocs = {
      Area => [:description_multiloc],
      Event => [:description_multiloc],
      Idea => [:body_multiloc],
      Phase => [:description_multiloc],
      Project => [:description_multiloc],
      Page => [:body_multiloc]
    }

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
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

  desc "Linkifies multilocs"
  task :linkify_multilocs => [:environment] do |t, args|

    # All models that have a multiloc that can contain titles
    linkify_multilocs = {
      Area => :description_multiloc,
      Comment => :body_multiloc,
      CustomField => :description_multiloc,
      Event => :description_multiloc,
      Idea => :body_multiloc,
      Invite => :invite_text,
      OfficialFeedback => :body_multiloc,
      Page => :body_multiloc,
      Phase => :description_multiloc,
      Project => :description_multiloc
    }

    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        puts "Processing tenant #{tenant.host}..."
        linkify_multilocs.map do |claz, attr|
          claz.all.map do |instance|
            instance.send("sanitize_#{attr}")
            instance.update_columns(attr => instance.send(attr))
          end
        end
      end
    end
  end

  desc "Runs the TextImageService on all HTML multilocs that can have images"
  task :swap_all_html_images => [:environment] do |t, args|
    errors = []
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
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
      puts "Success!"
    else
      puts "Some issues occured."
      errors.each{|err| puts err}
    end
  end

  desc "Substitutes HTML URLs by the S3 url, according to a list of requested sustitutions (tenants that changed host)"
  task :substitute_html_relative_paths, [:url] => [:environment] do |t, args|
    tofix = JSON.parse open(args[:url]).read
    tofix.each do |host, clazzes|
      Apartment::Tenant.switch(host.gsub('.', '_')) do
        clazzes.each do |claz, instances|
          instances.each do |id, attributes|
            object = claz.constantize.find id
            attributes.each do |attribute, _|
              multiloc = object.send attribute
              multiloc.keys.each do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                doc.css("img")
                  .select do |img| 
                    img.attr('src') =~ /^$|^((http:\/\/.+)|(https:\/\/.+))/
                  end
                  .each do |img|
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

  desc "List HTML URLs not starting with home URL to be fixed"
  task :list_html_links_to_fix_not_home => [:environment] do |t, args|
    results = {}
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc&.keys&.each do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                doc.css("img")
                  .select do |img| 
                    ( img.attr('src') =~ /^$|^((http:\/\/.+)|(https:\/\/.+))/ &&
                      !img.attr('src').include?("#{tenant.host}/uploads/") &&
                      !img.attr('src').include?("s3.amazonaws.com") &&
                      !img.attr('src').include?("res.cloudinary.com")
                      )
                  end
                  .each do |img|
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

  desc "Lists all bad URLs across all multilocs that can contain images for all tenants"
  task :bad_multiloc_urls => :environment do
    results = {}
    regex = /https?:\/\/[^ "']+[^a-zA-Z0-9\-._\/][^ "']*\.[a-zA-Z0-9]+/
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc.values.each do |value|
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

  desc "Replace all bad URLs according to the given mapping across all multilocs that can contain images for all tenants"
  task :replace_multiloc_urls, [:url] => [:environment] do |t, args|
    mapping = JSON.parse open(args[:url]).read
    results = {}
    errors = []
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        count = 0
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              changed = false
              multiloc = instance.send attribute
              multiloc.values.each do |value|
                mapping.each do |url_from, url_to|
                  value.gsub!(url_from){|_| changed=true; count+=1; url_to}
                end
              end
              if changed
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
        end
        results[tenant.host] = count
      end
    end
    puts JSON.pretty_generate(results)
    if errors.blank?
      puts "Success!"
    else
      puts "Some issues occured."
      errors.each{|err| puts err}
    end
  end


end

def convert_multiloc multiloc
  multiloc.each do |locale, html|
    multiloc[locale] = convert_html(html)
  end
end

def convert_html html
  doc = Nokogiri::HTML.fragment(html)
  h2s = doc.css('h2').each do |node|
    node.name = 'h3'
  end
  h1s = doc.css('h1').each do |node|
    node.name = 'h2'
  end
  doc.to_s
end

def imageable_html_multilocs
  {    
    Event                    => [:description_multiloc],
    Initiative               => [:body_multiloc],
    Page                     => [:body_multiloc],
    Phase                    => [:description_multiloc],
    Project                  => [:description_multiloc],
    EmailCampaigns::Campaign => [:body_multiloc]
  }
end