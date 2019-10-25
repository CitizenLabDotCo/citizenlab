
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

  desc "Substitutes HTML URLs by relative paths (gently)"
  task :substitute_html_relative_paths_gentle => [:environment] do |t, args|
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc.keys.each do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                doc.css("img")
                  .select do |img| 
                    ( img.attr('src') =~ /^$|^((http:\/\/.+)|(https:\/\/.+))/ &&
                      img.attr('src').start_with?("#{Frontend::UrlService.new.home_url}/uploads/")
                      )
                  end
                  .each do |img|
                    url = img.attr('src')
                    prefix = "#{Frontend::UrlService.new.home_url}/uploads/"
                    path = "/uploads/#{url.partition(prefix).last}"
                    img.set_attribute('src', path)
                  end
                multiloc[k] = doc.to_s
              end
              instance.send "#{attribute}=", multiloc
              instance.save!
            end
          end
        end
      end
    end
  end

  desc "Substitutes HTML URLs by relative paths (aggressively)"
  task :substitute_html_relative_paths_aggressive => [:environment] do |t, args|
    Tenant.all.map do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        imageable_html_multilocs.map do |claz, attributes|
          claz.all.map do |instance|
            attributes.each do |attribute|
              multiloc = instance.send attribute
              multiloc.keys.each do |k|
                text = multiloc[k]
                doc = Nokogiri::HTML.fragment(text)
                doc.css("img")
                  .select do |img| 
                    img.attr('src') =~ /^$|^((http:\/\/.+)|(https:\/\/.+))/
                  end
                  .each do |img|
                    url = img.attr('src')
                    path = "/uploads/#{url.partition('/uploads/').last}"
                    img.set_attribute('src', path)
                  end
                multiloc[k] = doc.to_s
              end
              instance.update_columns(attribute => multiloc)
            end
          end
        end
      end
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
    Area       => [:description_multiloc],
    Event      => [:description_multiloc],
    Idea       => [:body_multiloc],
    Initiative => [:body_multiloc],
    Page       => [:body_multiloc],
    Phase      => [:description_multiloc],
    Project    => [:description_multiloc]
  }
end