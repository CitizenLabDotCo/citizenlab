# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Export::Pdf::InputResponsesGenerator do
  let(:phase) { create(:native_survey_phase) }
  let(:cover) do
    { include: false, title: '', subtitle: '', date: '', prepared_by: '', notes: '' }
  end

  before do
    create(:idea_status_proposed)
    create_list(:native_survey_response, 2, project: phase.project, creation_phase: phase)
  end

  describe 'on_progress' do
    it 'is called once per input' do
      progress_ticks = 0
      generator = described_class.new(phase, cover: cover, on_progress: -> { progress_ticks += 1 })

      allow_any_instance_of(GotenbergClient).to receive(:render_html_to_pdf) do |_client, html|
        expect(html).to be_present
        StringIO.new('%PDF-1.4')
      end

      generator.generate_pdf
      expect(progress_ticks).to eq(2)
    end

    it 'is not called when rendering only the cover' do
      progress_ticks = 0
      generator = described_class.new(
        phase, cover: cover, cover_only: true, on_progress: -> { progress_ticks += 1 }
      )

      allow_any_instance_of(GotenbergClient).to receive(:render_html_to_pdf).and_return(StringIO.new('%PDF-1.4'))

      generator.generate_pdf
      expect(progress_ticks).to eq(0)
    end
  end
end
