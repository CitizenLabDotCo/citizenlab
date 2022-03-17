require 'rails_helper'

describe MachineTranslations::MachineTranslationService do
  let(:service) { described_class.new }

  describe 'translate' do
    before do
      stub_easy_translate!
    end

    it 'corrects translated HTML' do
      text = service.translate '<strong>Gezondheid &amp; Welzijn</strong>', 'nl-BE', 'en'
      doc = Nokogiri::HTML.fragment text
      expect(doc.errors).to be_blank
    end
  end

  private

  def stub_easy_translate!
    EasyTranslate.stub(:translate) do
      '<strong>Health & Wellness</strong>'
    end
  end
end
