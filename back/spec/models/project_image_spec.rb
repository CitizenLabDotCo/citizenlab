# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectImage do
  subject { create(:project_image) }

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_image)).to be_valid
    end
  end

  it { is_expected.to belong_to(:project) }
  it { is_expected.to validate_presence_of(:project) }
  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }

  describe '#sanitize_alt_text_multiloc' do
    it 'removes all HTML tags from alt_text_multiloc' do
      image = build(
        :project_image,
        alt_text_multiloc: {
          'en' => 'Thing <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      image.save!

      expect(image.alt_text_multiloc['en']).to eq('Thing alert("XSS") something')
      expect(image.alt_text_multiloc['fr-BE']).to eq('Something ')
      expect(image.alt_text_multiloc['nl-BE']).to eq('Plain text with formatting')
    end

    it 'sanitizes when escaped HTML tags present' do
      image = build(
        :project_image,
        alt_text_multiloc: {
          'en' => 'Something &lt;script&gt;alert("XSS")&lt;/script&gt; something',
          'fr-BE' => 'Something &lt;img src=x onerror=alert(1)&gt;',
          'nl-BE' => 'Plain &lt;b&gt;text&lt;/b&gt; with &lt;i&gt;formatting&lt;/i&gt;'
        }
      )

      image.save!

      expect(image.alt_text_multiloc['en']).to eq('Something alert("XSS") something')
      expect(image.alt_text_multiloc['fr-BE']).to eq('Something ')
      expect(image.alt_text_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
