# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventImage do
  subject { build(:event_image) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:event) }
  it { is_expected.to validate_presence_of(:event) }
  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }

  describe '#sanitize_alt_text_multiloc' do
    it 'removes all HTML tags from alt_text_multiloc' do
      image = build(
        :event_image,
        alt_text_multiloc: {
          'en' => 'Something <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      image.save!

      expect(image.alt_text_multiloc['en']).to eq('Something alert("XSS") something')
      expect(image.alt_text_multiloc['fr-BE']).to eq('Something ')
      expect(image.alt_text_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
