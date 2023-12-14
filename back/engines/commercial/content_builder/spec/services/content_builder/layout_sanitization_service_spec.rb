# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutSanitizationService do
  let(:service) { described_class.new }

  describe 'sanitize' do
    it 'sanitizes the HTML in text elements' do
      input_craftjson = craftjson_with_text '<p>Unsanitized text</p>'
      expected_craftjson = craftjson_with_text '<p>Sanitized text</p>'
      allow(service.send(:html_sanitizer)).to receive(:sanitize).and_return('<p>Sanitized text</p>')

      output = service.sanitize(input_craftjson)
      expect(service.send(:html_sanitizer)).to have_received(:sanitize)
      expect(output).to eq(expected_craftjson)
    end
  end

  def craftjson_with_text(text)
    {
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
        'nodes' => ['XGtvXcaUr3'],
        'linkedNodes' => {}
      },
      'XGtvXcaUr3' => {
        'type' => {
          'resolvedName' => 'TextMultiloc'
        },
        'isCanvas' => false,
        'props' => {
          'text' => { 'fr-FR' => text },
          'id' => 'text'
        },
        'displayName' => 'TextMultiloc',
        'custom' => {},
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    }
  end
end
