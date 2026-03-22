# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StyleSettings do
  let(:schema) { AppConfiguration.style_json_schema }
  let(:color_patterns) do
    schema.dig('definitions', 'color', 'anyOf')
      .select { |entry| entry.key?('pattern') }
      .to_h { |entry| [entry['title'], Regexp.new(entry['pattern'])] }
  end

  describe 'style.schema.json color patterns' do
    describe 'hex pattern' do
      let(:pattern) { color_patterns['hex'] }

      it 'matches 3-digit hex' do
        expect(pattern).to match('#fff')
        expect(pattern).to match('#ABC')
      end

      it 'matches 6-digit hex' do
        expect(pattern).to match('#123def')
        expect(pattern).to match('#AABBCC')
      end

      it 'rejects invalid hex' do
        expect(pattern).not_to match('#gg')
        expect(pattern).not_to match('#12345')
        expect(pattern).not_to match('123def')
        expect(pattern).not_to match('#1234567')
      end
    end

    describe 'rgb pattern' do
      let(:pattern) { color_patterns['rgb'] }

      it 'matches valid rgb values' do
        expect(pattern).to match('rgb(0,0,0)')
        expect(pattern).to match('rgb(255,255,255)')
        expect(pattern).to match('rgb( 128 , 64 , 32 )')
      end

      it 'matches rgb with percent values' do
        expect(pattern).to match('rgb(100%,50%,0%)')
      end

      it 'rejects out-of-range values' do
        expect(pattern).not_to match('rgb(256,0,0)')
        expect(pattern).not_to match('rgb(-1,0,0)')
      end

      it 'rejects invalid formats' do
        expect(pattern).not_to match('rgb(0,0)')
        expect(pattern).not_to match('notrgb(0,0,0)')
      end
    end

    describe 'rgba pattern' do
      let(:pattern) { color_patterns['rgba'] }

      it 'matches valid rgba values' do
        expect(pattern).to match('rgba(255, 255, 255, 0)')
        expect(pattern).to match('rgba(0,0,0,1)')
        expect(pattern).to match('rgba(128, 64, 32, 0.5)')
      end

      it 'rejects out-of-range color values' do
        expect(pattern).not_to match('rgba(256,0,0,1)')
      end

      it 'rejects invalid formats' do
        expect(pattern).not_to match('rgba(0,0,0)')
        expect(pattern).not_to match('rgb(0,0,0,1)')
      end
    end

    describe 'hsl pattern' do
      let(:pattern) { color_patterns['hsl'] }

      it 'matches valid hsl values' do
        expect(pattern).to match('hsl(180, 50%, 50%)')
        expect(pattern).to match('hsl(0, 0%, 0%)')
        expect(pattern).to match('hsl(359, 100%, 100%)')
      end

      it 'rejects out-of-range hue' do
        expect(pattern).not_to match('hsl(360, 50%, 50%)')
      end

      it 'rejects missing percent signs' do
        expect(pattern).not_to match('hsl(180, 50, 50)')
      end

      it 'rejects invalid formats' do
        expect(pattern).not_to match('hsl(180, 50%)')
        expect(pattern).not_to match('nothsl(180, 50%, 50%)')
      end
    end
  end
end
