# frozen_string_literal: true

require 'rails_helper'

# TODO: Move into single_run spec folder
describe 'rake migrate_craftjson' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  describe ':homepage' do
    let(:whitespace) do
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
    let(:top_info_section_multiloc) { { 'en' => 'top info section en', 'nl-BE' => 'top info section nl' } }
    let(:bottom_info_section_multiloc) { { 'en' => 'bottom info section en', 'nl-BE' => 'bottom info section nl' } }
    let(:currently_working_on_text) { { 'en' => 'currently working on en', 'nl-BE' => 'currently working on nl' } }
    let!(:homepage) do
      create(
        :home_page,
        top_info_section_enabled: true,
        top_info_section_multiloc: top_info_section_multiloc,
        bottom_info_section_enabled: true,
        bottom_info_section_multiloc: bottom_info_section_multiloc,
        events_widget_enabled: true
      )
    end

    it 'migrates the homepage craftjs with the expected properties' do
      config = AppConfiguration.instance
      config.settings['core']['currently_working_on_text'] = currently_working_on_text
      config.save!

      Rake::Task['migrate_craftjson:homepage'].invoke

      homepage.reload
      expect(homepage.craftjs_json['ROOT']).to match({
        'type' => 'div',
        'isCanvas' => true,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div',
        'custom' => {},
        'hidden' => false,
        'nodes' => kind_of(Array),
        'linkedNodes' => {}
      })
      homepagebanner, whitespace1, topinfosection, whitespace2, projects, events, proposals, whitespace3, bottominfosection, whitespace4 = homepage.craftjs_json['ROOT']['nodes']
      expect(homepage.craftjs_json[homepagebanner]).to match({
        'type' => { 'resolvedName' => 'HomepageBanner' },
        'isCanvas' => false,
        'props' => {
          'homepageSettings' => {
            'banner_layout' => 'full_width_banner_layout',
            'banner_avatars_enabled' => true,
            'banner_cta_signed_in_url' => nil,
            'banner_cta_signed_out_url' => nil,
            'banner_cta_signed_in_type' => 'no_button',
            'banner_cta_signed_out_type' => 'sign_up_button',
            'banner_signed_in_header_multiloc' => { 'en' => 'Welcome!', 'nl-BE' => 'Welkom!' },
            'banner_signed_out_header_multiloc' => { 'en' => 'Welcome!', 'nl-BE' => 'Welkom!' },
            'banner_cta_signed_in_text_multiloc' => {},
            'banner_cta_signed_out_text_multiloc' => {},
            'banner_signed_in_header_overlay_color' => '#0A5159',
            'banner_signed_out_header_overlay_color' => nil,
            'banner_signed_in_header_overlay_opacity' => nil,
            'banner_signed_out_header_overlay_opacity' => nil,
            'banner_signed_out_subheader_multiloc' => { 'en' => 'Sign up to participate', 'nl-BE' => 'Aanmelden om mee te doen' }
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
      })
      expect(homepage.craftjs_json[whitespace1]).to eq whitespace
      expect(homepage.craftjs_json[topinfosection]).to match({
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'isCanvas' => false,
        'props' => { 'text' => top_info_section_multiloc },
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
      })
      expect(homepage.craftjs_json[whitespace2]).to eq whitespace
      expect(homepage.craftjs_json[projects]).to match({
        'type' => { 'resolvedName' => 'Projects' },
        'isCanvas' => false,
        'props' => {
          'currentlyWorkingOnText' => currently_working_on_text
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
      })
      expect(homepage.craftjs_json[events]).to match({
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
      })
      expect(homepage.craftjs_json[proposals]).to match({
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
      })
      expect(homepage.craftjs_json[whitespace3]).to eq whitespace
      expect(homepage.craftjs_json[bottominfosection]).to match({
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'isCanvas' => false,
        'props' => { 'text' => bottom_info_section_multiloc },
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
      })
      expect(homepage.craftjs_json[whitespace4]).to eq whitespace
    end
  end
end
