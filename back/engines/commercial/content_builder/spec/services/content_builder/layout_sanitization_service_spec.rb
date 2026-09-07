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

    it 'sanitizes the HTML in html elements' do
      input_craftjson = craftjson_with_html '<img src="image.jpeg" onerror="alert(1)" />'
      expected_craftjson = craftjson_with_html '<img src="image.jpeg" />'
      allow(service.send(:html_block_sanitizer)).to receive(:sanitize).and_return('<img src="image.jpeg" />')

      output = service.sanitize(input_craftjson)
      expect(service.send(:html_block_sanitizer)).to have_received(:sanitize)
      expect(output).to eq(expected_craftjson)
    end

    # Text widgets are where project and folder descriptions live, so these run the real
    # sanitizer rather than a stub: this is the layer that has to hold.
    describe 'against the real sanitizer' do
      def sanitized_text(html, widget: 'TextMultiloc')
        output = service.sanitize(craftjson_with_text(html, widget: widget))
        output['XGtvXcaUr3']['props']['text']['fr-FR']
      end

      %w[TextMultiloc RichTextMultiloc].each do |widget|
        it "strips script tags from a #{widget} widget, keeping the allowed markup" do
          output = sanitized_text(
            '<p>Test</p><script>alert(1)</script><h2>Title</h2><ul><li>A bullet</li></ul>',
            widget: widget
          )

          expect(output).not_to include('<script')
          expect(output).to include('<p>Test</p>', '<h2>Title</h2>', '<li>A bullet</li>')
        end

        it "strips event-handler attributes from a #{widget} widget" do
          expect(sanitized_text('<img src="x" onerror="alert(1)">', widget: widget)).not_to include('onerror')
        end

        it "strips javascript: URLs from a #{widget} widget" do
          expect(sanitized_text('<a href="javascript:alert(1)">click</a>', widget: widget))
            .not_to include('javascript:')
        end
      end
    end
  end

  def craftjson_with_text(text, widget: 'TextMultiloc')
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
          'resolvedName' => widget
        },
        'isCanvas' => false,
        'props' => {
          'text' => { 'fr-FR' => text },
          'id' => 'text'
        },
        'displayName' => widget,
        'custom' => {},
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    }
  end

  def craftjson_with_html(html)
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
          'resolvedName' => 'HtmlBlockMultiloc'
        },
        'isCanvas' => false,
        'props' => {
          'html' => { 'fr-FR' => html },
          'id' => 'html'
        },
        'displayName' => 'HtmlBlockMultiloc',
        'custom' => {},
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    }
  end
end
