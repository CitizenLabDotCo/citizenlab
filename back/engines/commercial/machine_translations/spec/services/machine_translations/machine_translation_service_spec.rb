require 'rails_helper'

describe MachineTranslations::MachineTranslationService do
  describe 'translate' do
    before do
      stub_easy_translate!
    end

    it 'corrects translated HTML' do
      text = subject.translate '<strong>Gezondheid &amp; Welzijn</strong>', 'nl-BE', 'en'
      doc = Nokogiri::HTML.fragment text
      expect(doc.errors).to be_blank
      expect(text).to eq '<strong>Health &amp; Wellness</strong>'
    end
  end

  private

  def stub_easy_translate!
    EasyTranslate.stub(:translate) do
      '<strong>Health & Wellness</strong>'
    end
  end
end
