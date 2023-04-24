# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutImageService do
  let(:service) { described_class.new }

  describe 'swap_data_images' do
    it 'removes the src attribute from image elements' do
      layout_image = create(:layout_image)
      input = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => {
            'id' => 'e2e-content-builder-frame',
            'style' => {
              'padding' => '4px',
              'minHeight' => '160px',
              'backgroundColor' => '#fff'
            }
          },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[XGtvXcaUr3 nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'Image'
          },
          'isCanvas' => false,
          'props' => {
            'imageUrl' => layout_image.image.url,
            'id' => 'image',
            'alt' => '',
            'dataCode' => layout_image.code
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'XGtvXcaUr3' => {
          'type' => {
            'resolvedName' => 'Text'
          },
          'isCanvas' => false,
          'props' => {
            'text' => '<p>This is some text.</p>',
            'id' => 'text'
          },
          'displayName' => 'Text',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }
      expected_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => {
            'id' => 'e2e-content-builder-frame',
            'style' => {
              'padding' => '4px',
              'minHeight' => '160px',
              'backgroundColor' => '#fff'
            }
          },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[XGtvXcaUr3 nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'Image'
          },
          'isCanvas' => false,
          'props' => {
            'id' => 'image',
            'alt' => '',
            'dataCode' => layout_image.code
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'XGtvXcaUr3' => {
          'type' => {
            'resolvedName' => 'Text'
          },
          'isCanvas' => false,
          'props' => {
            'text' => '<p>This is some text.</p>',
            'id' => 'text'
          },
          'displayName' => 'Text',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      imageable = build(:layout, craftjs_jsonmultiloc: { 'nl-BE' => input })
      output = service.swap_data_images imageable, :craftjs_jsonmultiloc
      expect(output).to eq({ 'nl-BE' => expected_json })
    end
  end

  describe 'render_data_images' do
    it 'adds the src attribute to the image elements' do
      layout_image = create(:layout_image)
      input = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => {
            'id' => 'e2e-content-builder-frame',
            'style' => {
              'padding' => '4px',
              'minHeight' => '160px',
              'backgroundColor' => '#fff'
            }
          },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[XGtvXcaUr3 nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'Image'
          },
          'isCanvas' => false,
          'props' => {
            'id' => 'image',
            'alt' => '',
            'dataCode' => layout_image.code
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'XGtvXcaUr3' => {
          'type' => {
            'resolvedName' => 'Text'
          },
          'isCanvas' => false,
          'props' => {
            'text' => '<p>This is some text.</p>',
            'id' => 'text'
          },
          'displayName' => 'Text',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }
      expected_json = {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => {
            'id' => 'e2e-content-builder-frame',
            'style' => {
              'padding' => '4px',
              'minHeight' => '160px',
              'backgroundColor' => '#fff'
            }
          },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => %w[XGtvXcaUr3 nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'Image'
          },
          'isCanvas' => false,
          'props' => {
            'id' => 'image',
            'alt' => '',
            'dataCode' => layout_image.code,
            'imageUrl' => layout_image.image.url
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'XGtvXcaUr3' => {
          'type' => {
            'resolvedName' => 'Text'
          },
          'isCanvas' => false,
          'props' => {
            'text' => '<p>This is some text.</p>',
            'id' => 'text'
          },
          'displayName' => 'Text',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        }
      }

      imageable = build(:layout, craftjs_jsonmultiloc: { 'fr-BE' => input })
      output = service.render_data_images imageable, :craftjs_jsonmultiloc
      expect(output).to eq({ 'fr-BE' => expected_json })
    end
  end
end
