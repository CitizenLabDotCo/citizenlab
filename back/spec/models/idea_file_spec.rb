require 'rails_helper'

RSpec.describe IdeaFile, type: :model do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea_file)).to be_valid
    end
  end

  describe 'remote_file_url=' do
    it 'can deal with accents in file URL' do
      file = create(:idea_file)

      file_url = URI.decode 'https://seboslovakia.citizenlab.co/uploads/4365d891-7fad-4416-b8e3-fc9109a3027d/project_file/file/17f56e9e-b32c-4c30-bd76-688ff42f413e/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf'
      file.remote_file_url = file_url

      # file.remote_file_url = 'https://kortrijkspreekt.be/uploads/94774368-0e9d-406c-a765-457d58242666/project_file/file/1401b697-5bc6-4ddd-940e-61ee1211d0f6/OT_Q2020-2215_Schaal_1_250.pdf'
      # file.file = Rails.root.join('file://spec/fixtures/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A.pdf').open

      # file.remote_file_url = 'https://seboslovakia.citizenlab.co/uploads/4365d891-7fad-4416-b8e3-fc9109a3027d/project_folders/file/file/ea40a7c7-194a-4e86-a067-b5efc0cd5655/Vision_2028_de_Metro_Plan_Estrategico_A.pdf'
      
      # /usr/local/bundle/gems/carrierwave-2.2.2/lib/carrierwave/orm/activerecord.rb
      # /usr/local/bundle/gems/carrierwave-2.2.2/lib/carrierwave/downloader/base.rb:24 -> no hit
      # /usr/local/bundle/gems/carrierwave-2.2.2/lib/carrierwave/mounter.rb:97
      # /usr/local/bundle/gems/activerecord-6.1.4/lib/active_record/validations.rb:68
      # /usr/local/bundle/gems/activesupport-6.1.4/lib/active_support/callbacks.rb:512

      # b /usr/local/bundle/gems/activesupport-6.1.4/lib/active_support/callbacks.rb:105 -> no `errors`
      # b /usr/local/bundle/gems/activesupport-6.1.4/lib/active_support/callbacks.rb:106 -> has `errors`!
      # byebug
      file.save!
      # expect{file.save!}.not_to raise_error
    end
  end
end