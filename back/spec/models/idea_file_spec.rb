require 'rails_helper'

RSpec.describe IdeaFile, type: :model do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea_file)).to be_valid
    end
  end

  describe 'remote_file_url=' do
    it 'can deal with accents in file URL' do
      # file = IdeaFile.first
      # file.remote_file_url = 'https://usdemo21.template.citizenlab.co/uploads/da6b278b-c75d-498f-b3d0-f91c9ceaec79/project_file/file/979afd6f-c937-46eb-954a-a506e10781fd/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf'
      # file.save!

      file = create(:idea_file)
      file.remote_file_url = 'https://usdemo21.template.citizenlab.co/uploads/da6b278b-c75d-498f-b3d0-f91c9ceaec79/project_file/file/979afd6f-c937-46eb-954a-a506e10781fd/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf'
      expect{file.save!}.not_to raise_error
    end
  end
end