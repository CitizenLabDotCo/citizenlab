# frozen_string_literal: true

require 'rails_helper'

class FixImageWidthsTestMailer < ApplicationMailer
  include EmailCampaigns::EditableWithPreview
end

describe EmailCampaigns::EditableWithPreview do
  subject(:mailer) { FixImageWidthsTestMailer.new }

  def normalize(html)
    mailer.send(:fix_image_widths, html)
  end

  def img_attrs(html)
    img = Nokogiri::HTML.fragment(html).at_css('img')
    style = img['style'].to_s.split(';').map(&:strip).reject(&:empty?).sort
    { width: img['width'], height: img['height'], style: style }
  end

  describe '#fix_image_widths' do
    context 'with width="270px" (Quill blot-formatter2 legacy output)' do
      it 'normalizes to a unitless width attribute and an inline width style' do
        result = normalize('<img src="x" width="270px" height="auto">')
        expect(img_attrs(result)).to eq(
          width: '270',
          height: nil,
          style: ['height: auto', 'max-width: 100%', 'width: 270px']
        )
      end
    end

    context 'with width="270" (already-clean numeric attribute)' do
      it 'mirrors the value to the inline style' do
        result = normalize('<img src="x" width="270">')
        expect(img_attrs(result)).to eq(
          width: '270',
          height: nil,
          style: ['height: auto', 'max-width: 100%', 'width: 270px']
        )
      end
    end

    context 'with an inline style="width: 270px"' do
      it 'preserves the style and mirrors to the HTML attribute' do
        result = normalize('<img src="x" style="width: 270px">')
        expect(img_attrs(result)).to eq(
          width: '270',
          height: nil,
          style: ['height: auto', 'max-width: 100%', 'width: 270px']
        )
      end
    end

    context 'when style and HTML attribute disagree' do
      it 'lets the inline style win (admin-saved value)' do
        result = normalize('<img src="x" width="100" style="width: 270px">')
        expect(img_attrs(result)[:width]).to eq('270')
      end
    end

    context 'with width="100%"' do
      it 'keeps it as inline style and drops the HTML attribute' do
        result = normalize('<img src="x" width="100%">')
        attrs = img_attrs(result)
        expect(attrs[:width]).to be_nil
        expect(attrs[:style]).to include('width: 100%')
      end
    end

    context 'with no width' do
      it 'adds the safety net but no explicit width' do
        result = normalize('<img src="x">')
        expect(img_attrs(result)).to eq(
          width: nil,
          height: nil,
          style: ['height: auto', 'max-width: 100%']
        )
      end
    end

    context 'with float-based legacy alignment' do
      it 'translates float:left + the legacy margin into margin-auto centering on the left' do
        result = normalize('<img src="x" width="270" style="display: inline; float: left; margin: 0 1em 1em 0">')
        attrs = img_attrs(result)
        expect(attrs[:style]).to include('display: block')
        expect(attrs[:style]).to include('margin: 0 auto 1em 0')
        expect(attrs[:style]).not_to include(a_string_matching(/float\s*:/))
      end

      it 'translates float:right + the legacy margin into margin-auto on the right' do
        result = normalize('<img src="x" width="270" style="display: inline; float: right; margin: 0 0 1em 1em">')
        attrs = img_attrs(result)
        expect(attrs[:style]).to include('display: block')
        expect(attrs[:style]).to include('margin: 0 0 1em auto')
        expect(attrs[:style]).not_to include(a_string_matching(/float\s*:/))
      end

      it 'preserves a custom (non-default) margin while still removing the float' do
        result = normalize('<img src="x" style="float: left; margin: 5px 20px 5px 0">')
        attrs = img_attrs(result)
        expect(attrs[:style]).to include('margin: 5px 20px 5px 0')
        expect(attrs[:style]).not_to include(a_string_matching(/float\s*:/))
      end
    end

    context 'with an existing max-width' do
      it 'is respected (does not get overwritten)' do
        result = normalize('<img src="x" width="270px" style="max-width: 80%">')
        expect(img_attrs(result)[:style]).to include('max-width: 80%')
      end
    end

    context 'with an explicit height in pixels' do
      it 'preserves the numeric height attribute' do
        result = normalize('<img src="x" width="270" height="180">')
        expect(img_attrs(result)[:height]).to eq('180')
      end
    end

    context 'with multiple images' do
      it 'normalizes each independently' do
        html = '<p><img src="a" width="270px"></p><p><img src="b" width="410px"></p>'
        doc = Nokogiri::HTML.fragment(normalize(html))
        widths = doc.css('img').map { |i| i['width'] }
        expect(widths).to eq(%w[270 410])
      end
    end

    context 'with non-image HTML' do
      it 'leaves it untouched' do
        html = '<p>Hello <strong>world</strong></p>'
        expect(normalize(html)).to include('<p>Hello <strong>world</strong></p>')
      end
    end
  end
end
