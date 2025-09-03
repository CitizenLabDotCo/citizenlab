# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileMigratable do
  describe 'default scope' do
    let(:event_files) { create_list(:event_file, 2) }

    it 'only returns non-migrated files' do
      expect(EventFile.all).to match_array(event_files)

      e1, e2 = event_files
      e1.update!(migrated_file: create(:file))

      expect(EventFile.all).to contain_exactly(e2)
    end
  end

  describe 'migrated_file association' do
    let(:file_record) { create(:event_file) }

    it 'is optional' do
      expect(file_record.migrated_file).to be_nil
      expect(file_record).to be_valid
    end
  end
end
