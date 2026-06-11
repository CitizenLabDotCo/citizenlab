# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutTextImageService do
  let(:service) { described_class.new }

  def craftjs_with_rich_text(text_multiloc)
    {
      'ROOT' => {
        'type' => 'div',
        'isCanvas' => true,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div',
        'nodes' => ['bridge'],
        'linkedNodes' => {}
      },
      'bridge' => {
        'type' => { 'resolvedName' => 'RichTextMultiloc' },
        'isCanvas' => false,
        'props' => { 'text' => text_multiloc },
        'displayName' => 'RichTextMultiloc',
        'parent' => 'ROOT',
        'nodes' => [],
        'linkedNodes' => {}
      }
    }
  end

  describe '#render_data_images' do
    let(:project) { create(:project) }
    let(:text_image) { create(:text_image, imageable: project) }

    it 'injects the resolved src into inline images of a RichTextMultiloc node' do
      html = %(<p>Hi <img data-cl2-text-image-text-reference="#{text_image.text_reference}"></p>)
      craftjs_json = craftjs_with_rich_text({ 'en' => html })

      result = service.render_data_images(craftjs_json, imageable: project)

      rendered = result['bridge']['props']['text']['en']
      expect(rendered).to include('src=')
      expect(rendered).to include(text_image.text_reference)
    end

    it 'renders each locale of the text multiloc' do
      html = %(<p><img data-cl2-text-image-text-reference="#{text_image.text_reference}"></p>)
      craftjs_json = craftjs_with_rich_text({ 'en' => html, 'nl-BE' => html })

      result = service.render_data_images(craftjs_json, imageable: project)

      expect(result['bridge']['props']['text']['en']).to include('src=')
      expect(result['bridge']['props']['text']['nl-BE']).to include('src=')
    end

    it 'leaves text without image references untouched' do
      craftjs_json = craftjs_with_rich_text({ 'en' => '<p>Just text</p>' })

      result = service.render_data_images(craftjs_json, imageable: project)

      expect(result['bridge']['props']['text']['en']).to eq('<p>Just text</p>')
    end

    it 'ignores non-RichTextMultiloc nodes' do
      craftjs_json = {
        'ROOT' => { 'type' => 'div', 'isCanvas' => true, 'props' => {}, 'nodes' => ['text'], 'linkedNodes' => {} },
        'text' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'props' => { 'text' => { 'en' => %(<img data-cl2-text-image-text-reference="#{text_image.text_reference}">) } },
          'parent' => 'ROOT', 'nodes' => [], 'linkedNodes' => {}
        }
      }

      result = service.render_data_images(craftjs_json, imageable: project)

      expect(result['text']['props']['text']['en']).not_to include('src=')
    end

    it 'returns blank craftjs_json unchanged' do
      expect(service.render_data_images(nil)).to be_nil
      expect(service.render_data_images({})).to eq({})
    end
  end
end
