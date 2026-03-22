require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:update_smart_groups_with_is_pm_rule rake task' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['single_use:update_smart_groups_with_is_pm_rule'].reenable
  end

  context 'when there are smart groups with is_project_moderator rules' do
    let!(:group) { create(:group, rules: [{ 'ruleType' => 'role', 'predicate' => 'is_project_moderator' }, { 'ruleType' => 'role', 'predicate' => 'is_admin' }]) }

    context 'when there is a folder moderator' do
      let!(:project_folder_moderator) { create(:project_folder_moderator) }

      it 'updates is_project_moderator rules to is_moderator' do
        expect(group.rules).to include(hash_including('predicate' => 'is_project_moderator'))

        Rake::Task['single_use:update_smart_groups_with_is_pm_rule'].invoke('execute')

        group.reload
        expect(group.rules).to include(hash_including('predicate' => 'is_moderator'))
        expect(group.rules).to include(hash_including('predicate' => 'is_admin'))
        expect(group.rules).not_to include(hash_including('predicate' => 'is_project_moderator'))
      end
    end

    context 'when there are no folder moderators' do
      it 'updates nothing' do
        expect(group.rules).to include(hash_including('predicate' => 'is_project_moderator'))

        Rake::Task['single_use:update_smart_groups_with_is_pm_rule'].invoke('execute')

        group.reload
        expect(group.rules).to include(hash_including('predicate' => 'is_project_moderator'))
        expect(group.rules).to include(hash_including('predicate' => 'is_admin'))
        expect(group.rules).not_to include(hash_including('predicate' => 'is_moderator'))
      end
    end
  end

  context 'when there are no smart groups with is_project_moderator rules' do
    let!(:group) { create(:group, rules: [{ 'ruleType' => 'role', 'predicate' => 'is_admin' }]) }

    context 'when there is a folder moderator' do
      let!(:project_folder_moderator) { create(:project_folder_moderator) }

      it 'updates nothing' do
        expect { Rake::Task['single_use:update_smart_groups_with_is_pm_rule'].invoke('execute') }                                                                                                        
          .not_to change { group.reload.rules }
      end
    end

    context 'when there are no folder moderators' do
      it 'updates nothing' do
        expect { Rake::Task['single_use:update_smart_groups_with_is_pm_rule'].invoke('execute') }                                                                                            
          .not_to change { group.reload.rules }
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
