require 'rails_helper'

describe 'rake migrate_craftjson' do
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
    let(:top_info_section_multiloc) do
      {
        'en' => '<p><strong>top info section en</strong><a href="https://citizenlab.co" rel="noreferrer noopener nofollow">link</a><img class=\"ql-alt-text-input-container keepHTML\" alt=\"\" data-cl2-text-image-text-reference=missing-text-image></p>',
        'nl-BE' => "<p><img class=\"ql-alt-text-input-container keepHTML\" alt=\"\" data-cl2-text-image-text-reference=#{create(:text_image).text_reference}></p><iframe class=\"ql-video\" frameborder=\"0\" allowfullscreen=\"true\" src=\"https://www.youtube.com/embed/gw2RiADWfpg?showinfo=0\" width=\"818\" height=\"462.5234567901235\" data-blot-formatter-unclickable-bound=\"true\"></iframe>"
      }
    end
    let(:bottom_info_section_multiloc) do
      {
        'en' => '<p>bottom info section en</p><p><strong><a class="custom-button" href="https://www.facebook.com/" rel="noreferrer noopener nofollow" target="_blank">Facebook</a><a class="custom-button" href="https://www.instagram.com/" rel="noreferrer noopener nofollow" target="_blank">Instagram</a></strong></p>',
        'nl-BE' => '<iframe src="https://player.vimeo.com/video/729539513/"></iframe>'
      }
    end
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
      initial_layout_image_ids = ContentBuilder::LayoutImage.ids
      config = AppConfiguration.instance
      config.settings['core']['currently_working_on_text'] = currently_working_on_text
      config.save!

      Rake::Task['migrate_craftjson:homepage'].invoke

      layout = homepage.content_builder_layouts.find_by(code: 'homepage')
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
      homepagebanner, whitespace1, topinfosection, topimg, topiframe, whitespace2, projects, events, proposals, whitespace3, bottominfosection, bottombutton1, bottombutton2, bottomiframe, whitespace4 = layout.craftjs_json['ROOT']['nodes']
      expect(layout.craftjs_json[homepagebanner]).to match({
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
      expect(layout.craftjs_json[whitespace1]).to eq whitespace
      expect(layout.craftjs_json[topinfosection]).to match({
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'isCanvas' => false,
        'props' => {
          'text' => {
            'en' => '<p><strong>top info section en</strong><a href="https://citizenlab.co" rel="noreferrer noopener nofollow">link</a></p>',
            'nl-BE' => '<p></p>'
          }
        },
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
      expect(layout.craftjs_json[topimg]).to match({
        'type' => { 'resolvedName' => 'ImageMultiloc' },
        'nodes' => [],
        'props' => {
          'alt' => {},
          'image' => { 'dataCode' => ContentBuilder::LayoutImage.where.not(id: initial_layout_image_ids).first.code }
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
      })
      expect(layout.craftjs_json[topiframe]).to match({
        'type' => { 'resolvedName' => 'IframeMultiloc' },
        'nodes' => [],
        'props' => {
          'url' => 'https://www.youtube.com/embed/gw2RiADWfpg?showinfo=0',
          'height' => 462.5234567901235,
          'hasError' => false,
          'errorType' => 'invalidUrl',
          'selectedLocale' => 'en'
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
      })
      expect(layout.craftjs_json[whitespace2]).to eq whitespace
      expect(layout.craftjs_json[projects]).to match({
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
      expect(layout.craftjs_json[events]).to match({
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
      expect(layout.craftjs_json[whitespace3]).to eq whitespace
      expect(layout.craftjs_json[bottominfosection]).to match({
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'isCanvas' => false,
        'props' => {
          'text' => {
            'en' => '<p>bottom info section en</p><p><strong></strong></p>',
            'nl-BE' => ''
          }
        },
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
      expect(layout.craftjs_json[bottombutton1]).to match({
        'type' => { 'resolvedName' => 'ButtonMultiloc' },
        'nodes' => [],
        'props' => {
          'url' => 'https://www.facebook.com/',
          'text' => { 'en' => 'Facebook' },
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
      })
      expect(layout.craftjs_json[bottombutton2]).to match({
        'type' => { 'resolvedName' => 'ButtonMultiloc' },
        'nodes' => [],
        'props' => {
          'url' => 'https://www.instagram.com/',
          'text' => { 'en' => 'Instagram' },
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
      })
      expect(layout.craftjs_json[bottomiframe]).to match({
        'type' => { 'resolvedName' => 'IframeMultiloc' },
        'nodes' => [],
        'props' => {
          'url' => 'https://player.vimeo.com/video/729539513/',
          'height' => 500,
          'hasError' => false,
          'errorType' => 'invalidUrl',
          'selectedLocale' => 'en'
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
      })
      expect(layout.craftjs_json[whitespace4]).to eq whitespace
    end
  end
end
