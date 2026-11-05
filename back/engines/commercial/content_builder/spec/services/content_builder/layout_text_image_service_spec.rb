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

  describe '#swap_data_images' do
    let(:project) { create(:project) }
    let(:base64_img) { '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' }

    it 'extracts a new base64 image into a TextImage owned by the imageable and references it' do
      craftjs_json = craftjs_with_rich_text({ 'en' => "<p>Hi</p>#{base64_img}" })

      expect do
        service.swap_data_images(craftjs_json, imageable: project)
      end.to change(TextImage, :count).by(1)

      text_image = TextImage.order(:created_at).last
      expect(text_image.imageable).to eq(project)
      rendered = craftjs_json['bridge']['props']['text']['en']
      expect(rendered).to include("data-cl2-text-image-text-reference=\"#{text_image.text_reference}\"")
      expect(rendered).not_to include('src=')
    end

    it 'strips a serializer-injected src from an already-referenced image without creating a new TextImage' do
      text_image = create(:text_image, imageable: project)
      html = %(<img data-cl2-text-image-text-reference="#{text_image.text_reference}">)
      craftjs_json = craftjs_with_rich_text({ 'en' => html })
      rendered = service.render_data_images(craftjs_json, imageable: project)
      expect(rendered['bridge']['props']['text']['en']).to include('src=')

      expect do
        service.swap_data_images(rendered, imageable: project)
      end.not_to change(TextImage, :count)

      round_tripped = rendered['bridge']['props']['text']['en']
      expect(round_tripped).not_to include('src=')
      expect(round_tripped).to include(text_image.text_reference)
    end

    it 'ignores non-RichTextMultiloc nodes' do
      craftjs_json = {
        'ROOT' => { 'type' => 'div', 'isCanvas' => true, 'props' => {}, 'nodes' => ['text'], 'linkedNodes' => {} },
        'text' => {
          'type' => { 'resolvedName' => 'TextMultiloc' },
          'props' => { 'text' => { 'en' => base64_img } },
          'parent' => 'ROOT', 'nodes' => [], 'linkedNodes' => {}
        }
      }

      expect do
        service.swap_data_images(craftjs_json, imageable: project)
      end.not_to change(TextImage, :count)
      expect(craftjs_json['text']['props']['text']['en']).to eq(base64_img)
    end

    it 'returns blank craftjs_json unchanged' do
      expect(service.swap_data_images(nil)).to be_nil
      expect(service.swap_data_images({})).to eq({})
    end
  end
end
