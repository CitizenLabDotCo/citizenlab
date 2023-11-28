# frozen_string_literal: true

require 'rails_helper'

describe 'rake migrate_craftjson' do # rubocop:disable RSpec/DescribeClass
  before { load_rake_tasks_if_not_loaded }

  describe ':homepage' do
    it 'Makes the ordering field sequential for all user custom fields' do
      homepage = create(:home_page)

      Rake::Task['migrate_craftjson:homepage'].invoke

      homepage.reload
      expect(homepage.craftjs_json['ROOT']).to match({
        'type' => 'div',
        'isCanvas' => true,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div',
        'custom' => {},
        'hidden' => false,
        'nodes' => kind_of(Array),
        'linkedNodes' => {},
      })
    end
  end
end
