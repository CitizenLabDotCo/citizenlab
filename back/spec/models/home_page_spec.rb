# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomePage do
  describe 'validations' do
    it 'only allows once instance of homepage to exist' do
      create(:home_page)
      second_home_page = build(:home_page)

      expect(second_home_page).to be_invalid
      expect(second_home_page.errors[:base]).not_to be_empty
    end

    context 'when banner_cta_signed_out_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_signed_out_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_signed_out_url) }
      it { is_expected.to validate_presence_of(:banner_cta_signed_out_text_multiloc) }
    end

    context 'when banner_cta_signed_in_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_signed_in_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_signed_in_url) }
      it { is_expected.to validate_presence_of(:banner_cta_signed_in_text_multiloc) }
    end
  end

  describe 'image uploads' do
    subject(:home_page) { build(:home_page) }

    it 'stores a header background image' do
      home_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      home_page.save!
      expect(home_page.header_bg.url).to be_present
    end
  end

  describe 'craftjs_json' do
    it 'is uses the .json.erb as default value' do
      create(:home_page)
      layout = ContentBuilder::Layout.find_by(code: 'homepage')
      expect(layout.craftjs_json['ROOT']).to match({
        'type' => 'div',
        'isCanvas' => true,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div',
        'custom' => {},
        'hidden' => false,
        'nodes' => kind_of(Array),
        'linkedNodes' => {}
      })
      homepagebanner, projects, proposals = layout.craftjs_json['ROOT']['nodes']
      expect(layout.craftjs_json[homepagebanner]).to match({
        'type' => { 'resolvedName' => 'HomepageBanner' },
        'isCanvas' => false,
        'props' => {
          'homepageSettings' => {
            'banner_layout' => 'full_width_banner_layout',
            'banner_avatars_enabled' => true,
            'banner_cta_signed_in_url' => '',
            'banner_cta_signed_out_url' => '',
            'banner_cta_signed_in_type' => 'no_button',
            'banner_cta_signed_out_type' => 'sign_up_button',
            'banner_signed_in_header_multiloc' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => ''),
            'banner_signed_out_header_multiloc' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => ''),
            'banner_cta_signed_in_text_multiloc' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => ''),
            'banner_cta_signed_out_text_multiloc' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => ''),
            'banner_signed_in_header_overlay_color' => '#0A5159',
            'banner_signed_out_header_overlay_color' => '#0A5159',
            'banner_signed_in_header_overlay_opacity' => 90,
            'banner_signed_out_header_overlay_opacity' => 90,
            'banner_signed_out_subheader_multiloc' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => '')
          },
          'image' => {
            'dataCode' => kind_of(String)
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
      expect(layout.craftjs_json[projects]).to match({
        'type' => { 'resolvedName' => 'Projects' },
        'isCanvas' => false,
        'props' => {
          'currentlyWorkingOnText' => hash_including('en' => '', 'nl-BE' => '', 'fr-BE' => '')
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
      expect(layout.craftjs_json[proposals]).to match({
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
    end
  end
end
