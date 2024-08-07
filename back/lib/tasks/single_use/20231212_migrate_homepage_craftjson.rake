# frozen_string_literal: true

namespace :migrate_craftjson do
  desc 'Fix existing homepage'
  task :homepage, %i[host] => [:environment] do |_t, args|
    manual = []
    errors = {}
    tenants = if args[:host]
      Tenant.where(host: args[:host])
    else
      Tenant.prioritize(Tenant.creation_finalized)
    end
    tenants.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        next if AppConfiguration.instance.feature_activated?('homepage_builder')

        Rails.logger.info tenant.host

        craftjs_json = {
          'ROOT' => {
            'type' => 'div',
            'isCanvas' => true,
            'props' => { 'id' => 'e2e-content-builder-frame' },
            'displayName' => 'div',
            'custom' => {},
            'hidden' => false,
            'nodes' => [],
            'linkedNodes' => {}
          }
        }

        add_elements craftjs_json, migrate_homepagebanner
        topinfosection_elts = migrate_topinfosection
        topinfosection_success = topinfosection_elts.size <= 3 # 2 whitespaces and 1 infosection (no separate image, iframe or button elements)
        add_elements craftjs_json, topinfosection_elts
        add_elements craftjs_json, migrate_projects
        add_elements craftjs_json, migrate_events
        add_elements craftjs_json, migrate_proposals
        bottominfosection_elts = migrate_bottominfosection
        bottominfosection_success = bottominfosection_elts.size <= 3 # 2 whitespaces and 1 infosection (no separate image, iframe or button elements)
        add_elements craftjs_json, bottominfosection_elts

        needs_manual_migration = !topinfosection_success || !bottominfosection_success

        homepage = HomePage.first
        layout = homepage.content_builder_layouts.find_by(code: 'homepage')
        if !layout
          errors[tenant.host] ||= []
          errors[tenant.host] += ['No homepage layout found']
        elsif !layout.update(craftjs_json: craftjs_json)
          errors[tenant.host] ||= []
          errors[tenant.host] += ["Failed to update homepage: #{homepage.errors.details}"]
        end

        if !needs_manual_migration && errors[tenant.host].blank? && tenant.host != 'kobenhavntaler.kk.dk'
          SettingsService.new.activate_feature! 'homepage_builder'
        else
          manual += [tenant.host]
        end
      end
    end

    Rails.logger.info "Manual migrations needed for: #{manual.join(', ')}"
    if errors.present?
      Rails.logger.info 'Some errors occurred!'
      pp errors
    else
      Rails.logger.info 'Success!'
    end
  end
end

def add_elements(craftjs_json, elements)
  elements.each do |elt|
    id = SecureRandom.alphanumeric(10)
    craftjs_json[id] = elt
    craftjs_json['ROOT']['nodes'] += [id]
  end
  craftjs_json
end

def migrate_homepagebanner
  homepage = HomePage.first
  config = AppConfiguration.instance
  homepagebannerelt = {
    'type' => { 'resolvedName' => 'HomepageBanner' },
    'isCanvas' => false,
    'props' => {
      'homepageSettings' => {
        'banner_layout' => homepage.banner_layout || 'full_width_banner_layout',
        'banner_avatars_enabled' => homepage.banner_avatars_enabled,
        'banner_cta_signed_in_url' => homepage.banner_cta_signed_in_url,
        'banner_cta_signed_out_url' => homepage.banner_cta_signed_out_url,
        'banner_cta_signed_in_type' => homepage.banner_cta_signed_in_type,
        'banner_cta_signed_out_type' => homepage.banner_cta_signed_out_type,
        'banner_signed_in_header_multiloc' => homepage.banner_signed_in_header_multiloc,
        'banner_signed_out_header_multiloc' => homepage.banner_signed_out_header_multiloc,
        'banner_cta_signed_in_text_multiloc' => homepage.banner_cta_signed_in_text_multiloc,
        'banner_cta_signed_out_text_multiloc' => homepage.banner_cta_signed_out_text_multiloc,
        'banner_signed_in_header_overlay_color' => config.style['signedInHeaderOverlayColor'] || config.settings.dig('core', 'color_main'),
        'banner_signed_out_header_overlay_color' => homepage.banner_signed_out_header_overlay_color,
        'banner_signed_in_header_overlay_opacity' => (homepage.banner_layout == 'fixed_ratio_layout' ? 100 : config.style['signedInHeaderOverlayOpacity']),
        'banner_signed_out_header_overlay_opacity' => homepage.banner_signed_out_header_overlay_opacity,
        'banner_signed_out_subheader_multiloc' => homepage.banner_signed_out_subheader_multiloc
      },
      'errors' => [],
      'hasError' => false
    },
    'displayName' => 'HomepageBanner',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.homepage.homepageBanner',
        'defaultMessage' => 'Homepage banner'
      },
      'noPointerEvents' => true,
      'noDelete' => true
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }

  if homepage.header_bg.url
    begin
      layout_image = ContentBuilder::LayoutImage.create!(remote_image_url: homepage.header_bg.url)
      homepagebannerelt['props']['image'] = { 'dataCode' => layout_image.code }
    rescue StandardError => e
      Rails.logger.error "Failed to migrate header_bg for #{Tenant.current.host}: #{e.message}"
    end
  end

  [homepagebannerelt]
end

def migrate_topinfosection
  homepage = HomePage.first
  return [] if !homepage.top_info_section_enabled || homepage.top_info_section_multiloc.blank? || homepage.top_info_section_multiloc.values.all?(&:blank?)

  [whitespace, *infosections(homepage.top_info_section_multiloc), whitespace]
end

def migrate_projects
  config = AppConfiguration.instance
  [{
    'type' => { 'resolvedName' => 'Projects' },
    'isCanvas' => false,
    'props' => {
      'currentlyWorkingOnText' => config.settings.dig('core', 'currently_working_on_text')
    },
    'displayName' => 'Projects',
    'custom' => {
      'title' => {
        'id' => 'app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.CraftComponents.Projects.projectsTitle',
        'defaultMessage' => 'Projects'
      },
      'noPointerEvents' => true,
      'noDelete' => true
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }]
end

def migrate_events
  homepage = HomePage.first
  return [] if !homepage.events_widget_enabled

  [{
    'type' => { 'resolvedName' => 'Events' },
    'isCanvas' => false,
    'props' => {},
    'displayName' => 'Events',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.homepage.eventsTitle',
        'defaultMessage' => 'Events'
      },
      'noPointerEvents' => true
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }]
end

def migrate_proposals
  return [] if !AppConfiguration.instance.feature_activated?('initiatives')

  [{
    'type' => { 'resolvedName' => 'Proposals' },
    'isCanvas' => false,
    'props' => {},
    'displayName' => 'Proposals',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.homepage.proposalsTitle',
        'defaultMessage' => 'Proposals'
      },
      'noPointerEvents' => true
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }]
end

def migrate_bottominfosection
  homepage = HomePage.first
  return [] if !homepage.bottom_info_section_enabled || homepage.bottom_info_section_multiloc.blank? || homepage.bottom_info_section_multiloc.values.all?(&:blank?)

  [whitespace, *infosections(homepage.bottom_info_section_multiloc), whitespace]
end

def whitespace
  {
    'type' => { 'resolvedName' => 'WhiteSpace' },
    'isCanvas' => false,
    'props' => { 'size' => 'medium' },
    'displayName' => 'WhiteSpace',
    'custom' => {
      'title' => {
        'id' => 'app.containers.AdminPage.ProjectDescription.whiteSpace',
        'defaultMessage' => 'White space'
      }
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }
end

def infosections(text_html_multiloc)
  extra_elts = extract_image_iframe_button_elements text_html_multiloc
  text_elt = {
    'type' => { 'resolvedName' => 'TextMultiloc' },
    'isCanvas' => false,
    'props' => { 'text' => text_html_multiloc },
    'displayName' => 'TextMultiloc',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
        'defaultMessage' => 'Text'
      }
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {}
  }
  [text_elt, *extra_elts]
end

def extract_image_iframe_button_elements(text_html_multiloc)
  tenant = Tenant.current
  return [] if !tenant.active? && !tenant.host.ends_with?('.template.citizenlab.co') # We will only do manual migrations for active tenants and templates

  extracted_elts = []
  text_html_multiloc.each do |locale, text_html|
    html_doc = Nokogiri::HTML.fragment text_html
    html_doc.css('img').each do |img_node|
      extracted_elt = extract_img_element(img_node)
      extracted_elts += [extracted_elt] if extracted_elt
      img_node.remove
    end
    html_doc.css('iframe').each do |iframe_node|
      extracted_elts += [extract_iframe_element(iframe_node)]
      iframe_node.remove
    end
    html_doc.css('a.custom-button').each do |button_node|
      extracted_elts += [extract_button_element(button_node, locale)]
      button_node.remove
    end
    text_html_multiloc[locale] = html_doc.to_s
  end
  extracted_elts
end

def extract_img_element(img_node)
  text_image = TextImage.find_by(text_reference: img_node.attr(:'data-cl2-text-image-text-reference'))
  return nil if !text_image

  layout_image = ContentBuilder::LayoutImage.create!(image: text_image.image)
  {
    'type' => { 'resolvedName' => 'ImageMultiloc' },
    'nodes' => [],
    'props' => {
      'alt' => {},
      'image' => { 'dataCode' => layout_image.code }
    },
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.imageMultiloc',
        'defaultMessage' => 'Image'
      }
    },
    'hidden' => false,
    'parent' => 'ROOT',
    'isCanvas' => false,
    'displayName' => 'Image',
    'linkedNodes' => {}
  }
end

def extract_iframe_element(iframe_node)
  {
    'type' => { 'resolvedName' => 'IframeMultiloc' },
    'nodes' => [],
    'props' => {
      'url' => iframe_node.attr(:src),
      'height' => iframe_node.attr(:height)&.to_f || 500,
      'hasError' => false,
      'errorType' => 'invalidUrl',
      'selectedLocale' => 'en' # TODO: Something?
    },
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.IframeMultiloc.url',
        'defaultMessage' => 'Embed'
      },
      'noPointerEvents' => true
    },
    'hidden' => false,
    'parent' => 'ROOT',
    'isCanvas' => false,
    'displayName' => 'Iframe',
    'linkedNodes' => {}
  }
end

def extract_button_element(button_node, locale)
  {
    'type' => { 'resolvedName' => 'ButtonMultiloc' },
    'nodes' => [],
    'props' => {
      'url' => button_node.attr(:href),
      'text' => { locale => button_node.text },
      'type' => 'primary',
      'alignment' => 'center'
    },
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.buttonMultiloc',
        'defaultMessage' => 'Button'
      },
      'noPointerEvents' => true
    },
    'hidden' => false,
    'parent' => 'ROOT',
    'isCanvas' => false,
    'displayName' => 'Button',
    'linkedNodes' => {}
  }
end
