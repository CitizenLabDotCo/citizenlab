# frozen_string_literal: true

require 'rails_helper'

describe 'rake migrate_craftjson' do
  before { load_rake_tasks_if_not_loaded }

  describe ':homepage' do
    it 'Makes the ordering field sequential for all user custom fields' do
      homepage = create(:home_page)

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
            'banner_signed_in_header_multiloc' => {"en"=>"Welcome!", "nl-BE"=>"Welkom!"},
            'banner_signed_out_header_multiloc' => {"en"=>"Welcome!", "nl-BE"=>"Welkom!"},
            'banner_cta_signed_in_text_multiloc' => {},
            'banner_cta_signed_out_text_multiloc' => {},
            'banner_signed_in_header_overlay_color' => '#0A5159',
            'banner_signed_out_header_overlay_color' => nil,
            'banner_signed_in_header_overlay_opacity' => nil,
            'banner_signed_out_header_overlay_opacity' => nil,
            'banner_signed_out_subheader_multiloc' => {"en"=>"Sign up to participate", "nl-BE"=>"Aanmelden om mee te doen"}
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
    end
  end
end
