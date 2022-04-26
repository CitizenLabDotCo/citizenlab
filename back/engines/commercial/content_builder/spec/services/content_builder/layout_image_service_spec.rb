require 'rails_helper'

describe ContentBuilder::LayoutImageService do
  let(:service) { described_class.new }

  describe 'swap_data_images' do
    before do
      stub_request(:any, 'images.com').with(
        body: png_image_as_base64('image8.png')
      )
    end

    it 'removes the src attribute from image elements' do
      layout_image = create :layout_image
      input = JSON.parse <<~JSON
        {
          "ROOT": {
            "type": "div",
            "isCanvas": true,
            "props": {
              "id": "e2e-content-builder-frame",
              "style": {
                "padding": "4px",
                "minHeight": "160px",
                "backgroundColor": "#fff"
              }
            },
            "displayName": "div",
            "custom": {},
            "hidden": false,
            "nodes": ["XGtvXcaUr3", "nt24xY6COf"],
            "linkedNodes": {}
          },
          "nt24xY6COf":{
            "type": {
              "resolvedName": "Image"
            },
            "isCanvas": false,
            "props": {
              "imageUrl": "#{layout_image.image.url}",
              "id": "image",
              "alt": "",
              "dataCode": "#{layout_image.code}"
            },
            "displayName": "Image",
            "custom": {},
            "parent": "ROOT",
            "hidden": false,
            "nodes": [],
            "linkedNodes": {}
          },
          "XGtvXcaUr3":{
            "type": {
              "resolvedName": "Text"
            },
            "isCanvas": false,
            "props": {
              "text": "<p>This is some text.</p>",
              "id": "text"
            },
            "displayName": "Text",
            "custom": {},
            "parent": "ROOT",
            "hidden": false,
            "nodes": [],
            "linkedNodes":{}
          }
        }
      JSON
      imageable = build :layout, craftjs_jsonmultiloc: { 'nl-BE' => input }
      output = service.swap_data_images imageable, :craftjs_jsonmultiloc
      expected_html = JSON.parse <<~JSON
        {
          "ROOT": {
            "type": "div",
            "isCanvas": true,
            "props": {
              "id": "e2e-content-builder-frame",
              "style": {
                "padding": "4px",
                "minHeight": "160px",
                "backgroundColor": "#fff"
              }
            },
            "displayName": "div",
            "custom": {},
            "hidden": false,
            "nodes": ["XGtvXcaUr3", "nt24xY6COf"],
            "linkedNodes": {}
          },
          "nt24xY6COf":{
            "type": {
              "resolvedName": "Image"
            },
            "isCanvas": false,
            "props": {
              "id": "image",
              "alt": "",
              "dataCode": "#{layout_image.code}"
            },
            "displayName": "Image",
            "custom": {},
            "parent": "ROOT",
            "hidden": false,
            "nodes": [],
            "linkedNodes": {}
          },
          "XGtvXcaUr3":{
            "type": {
              "resolvedName": "Text"
            },
            "isCanvas": false,
            "props": {
              "text": "<p>This is some text.</p>",
              "id": "text"
            },
            "displayName": "Text",
            "custom": {},
            "parent": "ROOT",
            "hidden": false,
            "nodes": [],
            "linkedNodes":{}
          }
        }
      JSON
      expect(output).to eq({ 'nl-BE' => expected_html })
    end
  end

  describe 'render_data_images' do
    it 'adds the src attribute to the image elements' do
      text_image_1, text_image_2 = create_list :text_image, 2
      input = <<~HTML
        <img data-cl2-text-image-text-reference="#{text_image_1.text_reference}">
        <div>no image here</div>
        <img data-cl2-text-image-text-reference="#{text_image_2.text_reference}">
      HTML
      imageable = build :project, description_multiloc: { 'fr-BE' => input }
      output = <<~HTML
        <img data-cl2-text-image-text-reference="#{text_image_1.text_reference}" src="#{text_image_1.image.url}">
        <div>no image here</div>
        <img data-cl2-text-image-text-reference="#{text_image_2.text_reference}" src="#{text_image_2.image.url}">
      HTML
      expect(service.render_data_images(imageable, :description_multiloc)).to eq({ 'fr-BE' => output })
    end
  end
end
