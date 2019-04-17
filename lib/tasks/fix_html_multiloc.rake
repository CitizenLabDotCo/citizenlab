
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