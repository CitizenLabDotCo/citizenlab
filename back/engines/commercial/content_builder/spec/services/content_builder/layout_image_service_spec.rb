# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutImageService do
  let(:service) { described_class.new }

  describe 'swap_data_images' do
    it 'removes the src attribute from image elements' do
      layout_image = create(:layout_image)
      craftjs_json = {
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
            'resolvedName' => 'ImageMultiloc'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'imageUrl' => layout_image.image.url,
              'id' => 'image',
              'alt' => '',
              'dataCode' => layout_image.code
            }
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
            'resolvedName' => 'ImageMultiloc'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'id' => 'image',
              'alt' => '',
              'dataCode' => layout_image.code
            }
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

      imageable = build(:homepage_layout, craftjs_json: craftjs_json)
      output = service.swap_data_images imageable.craftjs_json
      expect(output).to eq expected_json
    end
  end

  describe 'render_data_images' do
    it 'adds the src attribute to the image elements' do
      layout_image = create(:layout_image)
      craftjs_json = {
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
          'nodes' => %w[XGtvXcaUr3 B8vvp7in1B nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'ImageMultiloc'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'id' => 'image',
              'alt' => '',
              'dataCode' => layout_image.code
            }
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'B8vvp7in1B' => {
          'type' => {
            'resolvedName' => 'HomepageBanner'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'dataCode' => layout_image.code
            }
          },
          'displayName' => 'HomepageBanner',
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
          'nodes' => %w[XGtvXcaUr3 B8vvp7in1B nt24xY6COf],
          'linkedNodes' => {}
        },
        'nt24xY6COf' => {
          'type' => {
            'resolvedName' => 'ImageMultiloc'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'id' => 'image',
              'alt' => '',
              'dataCode' => layout_image.code,
              'imageUrl' => layout_image.image.url
            }
          },
          'displayName' => 'Image',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'B8vvp7in1B' => {
          'type' => {
            'resolvedName' => 'HomepageBanner'
          },
          'isCanvas' => false,
          'props' => {
            'image' => {
              'dataCode' => layout_image.code,
              'imageUrl' => layout_image.image.url
            }
          },
          'displayName' => 'HomepageBanner',
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

      imageable = build(:homepage_layout, craftjs_json: craftjs_json)
      output = service.render_data_images imageable.craftjs_json
      expect(output).to eq expected_json
    end

    it 'can deal with craftjs_json in an unexpected format' do
      craftjs_json = {
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
          'nodes' => %w[B8vvp7in1B XGtvXcaUr3],
          'linkedNodes' => {}
        },
        'B8vvp7in1B' => {
          'type' => {
            'resolvedName' => 'HomepageBanner'
          },
          'isCanvas' => false,
          'props' => {}, # Empty props
          'displayName' => 'HomepageBanner',
          'custom' => {},
          'parent' => 'ROOT',
          'hidden' => false,
          'nodes' => [],
          'linkedNodes' => {}
        },
        'XGtvXcaUr3' => {
          'badtype' => 42, # Bad type format
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

      imageable = build(:homepage_layout, craftjs_json: craftjs_json)
      output = service.render_data_images imageable.craftjs_json
      expect(output).to eq craftjs_json
    end
  end
end
