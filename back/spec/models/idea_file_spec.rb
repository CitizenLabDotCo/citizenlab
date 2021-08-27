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

      # file.remote_file_url = 'https://seboslovakia.citizenlab.co/uploads/4365d891-7fad-4416-b8e3-fc9109a3027d/project_file/file/17f56e9e-b32c-4c30-bd76-688ff42f413e/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf'
      # file.remote_file_url = 'https://kortrijkspreekt.be/uploads/94774368-0e9d-406c-a765-457d58242666/project_file/file/1401b697-5bc6-4ddd-940e-61ee1211d0f6/OT_Q2020-2215_Schaal_1_250.pdf'
      # file.file = Rails.root.join('file://spec/fixtures/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf').open

      file.remote_file_url = 'https://seboslovakia.citizenlab.co/uploads/4365d891-7fad-4416-b8e3-fc9109a3027d/project_folders/file/file/ea40a7c7-194a-4e86-a067-b5efc0cd5655/Vision_2028_de_Metro_Plan_Estrategico_A.pdf'
      expect{file.save!}.not_to raise_error
    end
  end
end