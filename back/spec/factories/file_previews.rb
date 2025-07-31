FactoryBot.define do
  factory :file_preview, class: 'Files::Preview' do
    file
    content do
      Rails.root.join('spec/fixtures/minimal_pdf.pdf').open
    end
  end
end
