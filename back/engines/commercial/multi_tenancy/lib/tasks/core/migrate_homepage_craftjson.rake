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
        topinfosection_elts, topinfosection_success = migrate_topinfosection
        add_elements craftjs_json, topinfosection_elts
        add_elements craftjs_json, migrate_projects
        add_elements craftjs_json, migrate_events
        add_elements craftjs_json, migrate_proposals
        bottominfosection_elts, bottominfosection_success = migrate_bottominfosection
        add_elements craftjs_json, bottominfosection_elts

        homepage = HomePage.first
        if !homepage.update(craftjs_json: craftjs_json)
          errors[tenant.host] ||= []
          errors[tenant.host] += ["Failed to update homepage: #{homepage.errors.details}"]
        end

        if topinfosection_success && bottominfosection_success && errors[tenant.host].blank? && tenant.host != 'kobenhavntaler.kk.dk'
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
        'banner_signed_in_header_overlay_color' => (config.style['signedInHeaderOverlayColor'] || config.settings.dig('core', 'color_main')),
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
    layout_image = ContentBuilder::LayoutImage.create!(remote_image_url: homepage.header_bg.url)
    homepagebannerelt['props']['image'] = { 'dataCode' => layout_image.code }
  end

  [homepagebannerelt]
end

def migrate_topinfosection
  homepage = HomePage.first
  return [[], true] if !homepage.top_info_section_enabled || homepage.top_info_section_multiloc.blank? || homepage.top_info_section_multiloc.values.all?(&:blank?)

  infosections, success = infosection(homepage.top_info_section_multiloc)

  [[whitespace, *infosections, whitespace], success]
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
  return [[], true] if !homepage.bottom_info_section_enabled || homepage.bottom_info_section_multiloc.blank? || homepage.bottom_info_section_multiloc.values.all?(&:blank?)

  infosections, success = infosection(homepage.bottom_info_section_multiloc)

  [[whitespace, *infosections, whitespace], success]
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

def infosection(text_html_multiloc)
  success = true
  success = false if text_html_multiloc.values.any? { |text_html| text_html.match?(/<img|<iframe|custom-button/) }
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
  [[text_elt], success]
end
