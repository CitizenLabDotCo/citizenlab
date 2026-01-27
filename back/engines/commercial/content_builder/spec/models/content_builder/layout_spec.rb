# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Layout do
  context 'when the layout is not initialized' do
    subject { build(:default_layout) }

    its(:content_buildable_type) { is_expected.to be_nil }
    its(:content_buildable_id) { is_expected.to be_nil }
    its(:code) { is_expected.to be_nil }
    its(:enabled) { is_expected.to be false }
    its(:created_at) { is_expected.to be_nil }
    its(:updated_at) { is_expected.to be_nil }
  end

  describe 'with_widget_type scope' do
    before_all do
      _non_matching_layout = create(:layout, craftjs_json: {
        'ROOT' => { 'type' => 'div' },
        'node-1' => { 'type' => { 'resolvedName' => 'NotQueried' } }
      })
    end

    let_it_be(:layout1) do
      create(:layout, craftjs_json: {
        'ROOT' => { 'type' => 'div' },
        'node-1' => { 'type' => { 'resolvedName' => 'Widget1' } },
        'node-2' => { 'type' => { 'resolvedName' => 'Widget2' } },
        'node-3' => { 'type' => { 'resolvedName' => 'Widget2' } }
      })
    end

    let_it_be(:layout2) do
      create(:layout, craftjs_json: {
        'ROOT' => { 'type' => 'div' },
        'node-1' => { 'type' => { 'resolvedName' => 'Widget1' } },
        'node-2' => { 'type' => { 'resolvedName' => 'Widget3' } }
      })
    end

    it 'returns all the layouts that contain the specified widget type' do
      expect(described_class.with_widget_type('Widget1'))
        .to contain_exactly(layout1, layout2)
    end

    it 'does not duplicate layouts that contain multiple instances of the widget type' do
      expect(described_class.with_widget_type('Widget2'))
        .to contain_exactly(layout1)
    end

    it 'returns all the layouts that contain the specified widget types' do
      expect(described_class.with_widget_type('Widget2', 'Widget3'))
        .to contain_exactly(layout1, layout2)
    end

    it 'returns an empty array when no layout contains the specified widget type' do
      expect(described_class.with_widget_type('Widget4')).to be_empty
    end
  end

  describe '#valid?' do
    it 'returns false when code is not present' do
      layout = build(:layout, code: nil)
      expect(layout).to be_invalid
      expect(layout.errors.details).to eq({ code: [{ error: :blank }] })
    end

    it 'returns false for an iframe with an invalid url' do
      url = 'malicious.com/my-video'
      layout = build(:layout, craftjs_json: craftjson_with_iframe_url(url))
      expect(layout).to be_invalid
      expect(layout.errors.details).to eq({ craftjs_json: [{
        error: :iframe_url_invalid,
        url: url
      }] })
    end

    it 'returns true otherwise' do
      expect(build(:layout, craftjs_json: craftjson_with_iframe_url('https://www.youtube.com/embed/gdfWFDcXut4'))).to be_valid
    end
  end

  describe '#save' do
    subject { create(:layout) }

    its(:content_buildable_type) { is_expected.to eq('Project') }
    its(:content_buildable_id) { is_expected.to eq(Project.last.id) }
    its(:code) { is_expected.to eq('layout-1') }
    its(:enabled) { is_expected.to be true }
    its(:created_at) { is_expected.to be_an_instance_of(ActiveSupport::TimeWithZone) }
    its(:updated_at) { is_expected.to be_an_instance_of(ActiveSupport::TimeWithZone) }
  end

  describe '#content_buildable' do
    context 'when the content buildable exists' do
      subject(:layout) { create(:layout) }

      it 'returns the content buildable' do
        expect(layout.content_buildable).to be_instance_of Project
        expect(layout.content_buildable.id).to eq layout.content_buildable_id
      end
    end

    context 'when the content buildable does not exist' do
      it 'raises ActiveRecord::RecordNotFound' do
        layout = create(:layout)
        layout.content_buildable.destroy
        expect { layout.reload }.to raise_error ActiveRecord::RecordNotFound
      end
    end

    context 'when the content buildable type is not a model class' do
      subject(:layout) { create(:layout, content_buildable_type: 'UnknownClassName') }

      it 'raises NameError' do
        expect { layout.content_buildable }.to raise_error NameError
      end
    end
  end

  describe '#duplicate!' do
    it 'creates a copy of the layout' do
      layout = create(
        :layout,
        code: 'layout-1',
        craftjs_json: craftjson_with_iframe_url('https://www.example.com')
      )

      layout_copy = layout.duplicate!

      expect(layout_copy).to be_instance_of(described_class)
      expect(layout_copy.content_buildable).to be_nil
      expect(layout_copy.code).to eq(layout.code)
      expect(layout_copy.enabled).to eq(layout.enabled)
      expect(layout_copy.craftjs_json).to eq(layout.craftjs_json)
    end

    it 'copies the images associated with the layout' do
      layout = create(:layout, :with_image)
      expect { layout.duplicate! }.to change(ContentBuilder::LayoutImage, :count).by(1)
    end
  end

  describe 'craftjs_json' do
    it 'is uses the .json.erb as default value' do
      layout = create(:homepage_layout)
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
      homepagebanner, projects = layout.craftjs_json['ROOT']['nodes']
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
    end
  end

  describe '#referenced_file_ids' do
    it 'returns fileIds from FileAttachment widgets' do
      layout = build(:layout, craftjs_json: {
        'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => %w[node1 node2] },
        'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'file-123' } },
        'node2' => { 'type' => { 'resolvedName' => 'TextMultiloc' }, 'props' => {} }
      })

      expect(layout.referenced_file_ids).to eq(['file-123'])
    end

    it 'returns empty array for blank craftjs_json' do
      layout = build(:layout, craftjs_json: nil)
      expect(layout.referenced_file_ids).to eq([])

      layout.craftjs_json = {}
      expect(layout.referenced_file_ids).to eq([])
    end
  end

  describe 'file attachment sync on save' do
    let(:file) { create(:file) }
    let(:another_file) { create(:file) }

    it 'creates missing file attachments' do
      layout = create(:layout, craftjs_json: {
        'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
        'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
      })

      expect(layout.file_attachments.where(file: file).count).to eq(1)
    end

    it 'deletes attachments no longer referenced' do
      layout = create(:layout, craftjs_json: {
        'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
        'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
      })

      orphaned_attachment = create(:file_attachment, file: another_file, attachable: layout)
      layout.save!

      expect { orphaned_attachment.reload }.to raise_error ActiveRecord::RecordNotFound
      expect(layout.file_attachments.where(file: file).count).to eq(1)
    end
  end

  def craftjson_with_iframe_url(url)
    {
      'ROOT' => {
        'type' => 'div',
        'isCanvas' => true,
        'props' => {
          'style' => {
            'padding' => '4px',
            'minHeight' => '160px',
            'backgroundColor' => '#fff'
          }
        },
        'displayName' => 'div',
        'custom' => {},
        'hidden' => false,
        'nodes' => [
          'sLvtGHTAha'
        ],
        'linkedNodes' => {}
      },
      'sLvtGHTAha' => {
        'type' => {
          'resolvedName' => 'IframeMultiloc'
        },
        'isCanvas' => false,
        'props' => {
          'url' => url,
          'height' => '400',
          'id' => 'Iframe',
          'hasError' => false
        },
        'displayName' => 'CraftIframe',
        'custom' => {},
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    }
  end
end
