# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Layout do
  context 'when the layout is not initialized' do
    subject { build(:default_layout) }

    its(:craftjs_jsonmultiloc) { is_expected.to eq({}) }
    its(:content_buildable_type) { is_expected.to be_nil }
    its(:content_buildable_id) { is_expected.to be_nil }
    its(:code) { is_expected.to be_nil }
    its(:enabled) { is_expected.to be false }
    its(:created_at) { is_expected.to be_nil }
    its(:updated_at) { is_expected.to be_nil }
  end

  describe '#valid?' do
    it 'returns false when content_buildable is not present' do
      layout = build(:default_layout, code: 'project_description')
      expect(layout).to be_invalid
      expect(layout.errors.to_hash).to eq({ content_buildable: ['must exist', "can't be blank"] })
    end

    it 'returns false when code is not present' do
      layout = build(:layout, code: nil)
      expect(layout).to be_invalid
      expect(layout.errors.details).to eq({ code: [{ error: :blank }] })
    end

    it 'returns false for an iframe with an invalid url' do
      url = 'malicious.com/my-video'
      craftjs_jsonmultiloc = { 'en' => craftjson_with_iframe_url(url) }
      layout = build(:layout, craftjs_jsonmultiloc: craftjs_jsonmultiloc)
      expect(layout).to be_invalid
      expect(layout.errors.details).to eq({ craftjs_jsonmultiloc: [{
        error: :iframe_url_invalid,
        locale: 'en',
        url: url
      }] })
    end

    it 'returns true otherwise' do
      craftjs_jsonmultiloc = { 'en' => craftjson_with_iframe_url('https://www.youtube.com/embed/gdfWFDcXut4') }
      expect(build(:layout, craftjs_jsonmultiloc: craftjs_jsonmultiloc)).to be_valid
    end
  end

  describe '#save' do
    subject { create(:layout) }

    its(:craftjs_jsonmultiloc) { is_expected.to eq({}) }
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
          'resolvedName' => 'Iframe'
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
