# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InitiativeFile do
  context 'file upload' do
    it 'should accept valid files' do
      initiative = create(:initiative)
      [
        ['minimal_mp3.mp3',   'audio/mpeg'],
        ['minimal_mpeg4.mp4', 'application/mp4'],
        ['audio_mp4.mp4',     'audio/mp4'],
        ['minimal_pdf.pdf',   'application/pdf'],
        ['david.mp4',         'video/mp4'],
        ['david.mp3',         'audio/mpeg'],
        ['david.csv',         'text/csv'],
        ['david.ppt',         'application/vnd.ms-powerpoint'],
        ['david.docx',        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ['david.doc',         'application/msword'],
        ['david.xlsx',        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['david.xls',         'application/vnd.ms-excel']
      ].each do |filename, mime_type|
        base64 = "data:#{mime_type};base64,#{Base64.encode64(Rails.root.join('spec', 'fixtures', filename).read)}"
        file = initiative.initiative_files.new(file_by_content: { name: filename, content: base64 })
        expect(file.save).to be true
      end
    end
  end
end
