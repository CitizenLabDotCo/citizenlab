# frozen_string_literal: true

namespace :migrate_craftjson do
  desc 'Analyze'
  task :analyze_homepages, %i[file] => [:environment] do |_t, args|
    filename = args[:file] || 'craftjsons.csv'
    data = CSV.parse(open(filename).read, { headers: true, col_sep: ',', converters: [] })
    data.each do |d|
      craftjson = JSON.parse(d['Craftjs Jsonmultiloc'])
      puts craftjson # Do stuff
    end
  end

  desc 'Fix existing homepage'
  task :homepage, %i[host] => [:environment] do |_t, args|
    errors = {}
    tenants = if args[:host]
      Tenant.where(host: args[:host])
    else
      Tenant.prioritize(Tenant.creation_finalized)
    end
    tenants.each do |tenant|
      Rails.logger.info tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        craftjs_json = {
          'ROOT' => {
            'type' => 'div',
            'isCanvas' => true,
            'props' => { 'id' => 'e2e-content-builder-frame' },
            'displayName' => 'div',
            'custom' => {},
            'hidden' => false,
            'nodes' => [],
            'linkedNodes' => {},
          }
        }

        add_elements craftjs_json, migrate_homepagebanner
        add_elements craftjs_json, migrate_topinfosection
        add_elements craftjs_json, migrate_projects
        add_elements craftjs_json, migrate_events
        add_elements craftjs_json, migrate_proposals
        add_elements craftjs_json, migrate_bottominfosection

        homepage = HomePage.first
        if !homepage.update(craftjs_json: craftjs_json)
          errors[tenant.host] ||= []
          errors[tenant.host] += ["Failed to update homepage: #{homepage.errors.details}"]
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
  homepagebannerelt = {
    'type' => { 'resolvedName' => 'HomepageBanner' },
    'isCanvas' => false,
    'props' => {
      'homepageSettings' => {
        'banner_layout' => 'full_width_banner_layout',
        'banner_avatars_enabled' => homepage.banner_avatars_enabled,
        'banner_cta_signed_in_url' => (homepage.banner_cta_signed_in_url || ''),
        'banner_cta_signed_in_type' => homepage.banner_cta_signed_in_type,
        'banner_cta_signed_out_url' => (homepage.banner_cta_signed_out_url || 'https://www.citizenlab.co/'),
        'banner_cta_signed_out_type' => homepage.banner_cta_signed_out_type,
        'banner_signed_in_header_multiloc' => homepage.banner_signed_in_header_multiloc,
        'banner_signed_out_header_multiloc' => homepage.banner_signed_out_header_multiloc,
        'banner_cta_signed_in_text_multiloc' => homepage.banner_cta_signed_in_text_multiloc,
        'banner_cta_signed_out_text_multiloc' => homepage.banner_cta_signed_out_text_multiloc,
        'banner_signed_out_subheader_multiloc' => homepage.banner_signed_out_subheader_multiloc,
        'banner_signed_in_header_overlay_color' => '#0A5159', # Primary color?
        'banner_signed_out_header_overlay_color' => (homepage.banner_signed_out_header_overlay_color || '#0A5159'), # Fallback to primary color?
        'banner_signed_in_header_overlay_opacity' => 90, # Correct?
        'banner_signed_out_header_overlay_opacity' => (homepage.banner_signed_out_header_overlay_opacity || 90), # Correct?
      },
      'errors' => [],
      'hasError' => false,
    },
    'displayName' => 'HomepageBanner',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.homepage.homepageBanner',
        'defaultMessage' => 'Homepage banner',
      },
      'noPointerEvents' => true,
      'noDelete' => true,
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
  }

  if homepage.header_bg.url
    layout_image = ContentBuilder::LayoutImage.create!(remote_image_url: homepage.header_bg.url)
    homepagebannerelt['props']['image'] = { 'dataCode' => layout_image.code }
  end

  [homepagebannerelt]
end

def migrate_topinfosection
  homepage = HomePage.first
  return [] if !homepage.top_info_section_enabled || homepage.top_info_section_multiloc.blank?

  [
    whitespace,
    *infosection(homepage.top_info_section_multiloc),
    whitespace
  ]
end

def migrate_projects
  homepage = HomePage.first
  return [] if !homepage.projects_enabled

  [{
    'type' => { 'resolvedName' => 'Projects' },
    'isCanvas' => false,
    'props' => {
      'currentlyWorkingOnText' => homepage.projects_header_multiloc,
    },
    'displayName' => 'Projects',
    'custom' => {
      'title' => {
        'id' => 'app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.CraftComponents.Projects.projectsTitle',
        'defaultMessage' => 'Projects',
      },
      'noPointerEvents' => true,
      'noDelete' => true,
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
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
        'defaultMessage' => 'Events',
      },
      'noPointerEvents' => true,
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
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
        'defaultMessage' => 'Proposals',
      },
      'noPointerEvents' => true,
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
  }]
end

def migrate_bottominfosection
  homepage = HomePage.first
  return [] if !homepage.bottom_info_section_enabled || homepage.bottom_info_section_multiloc.blank?

  [
    whitespace,
    *infosection(homepage.bottom_info_section_multiloc),
    whitespace
  ]
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
        'defaultMessage' => 'White space',
      },
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
  }
end

def infosection(text_html_multiloc)
  [{
    'type' => { 'resolvedName' => 'TextMultiloc' },
    'isCanvas' => false,
    'props' => { 'text' => text_html_multiloc },
    'displayName' => 'TextMultiloc',
    'custom' => {
      'title' => {
        'id' => 'app.containers.admin.ContentBuilder.textMultiloc',
        'defaultMessage' => 'Text',
      },
    },
    'parent' => 'ROOT',
    'hidden' => false,
    'nodes' => [],
    'linkedNodes' => {},
  }]
end
