require 'rails_helper'

describe 'gv_transition:rename_profile rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['gv_transition:rename_profile'].reenable }

  it 'updates the participation context of the custom form to the project' do
    ['test1.govocal.com', 'test2.govocal.com'].each do |host|
      create(:test_tenant, host: host)
    end
    Tenant.find_by(host: 'test1.govocal.com').switch do
      create(:user, email: 'moderator@citizenlab.co', first_name: 'CitizenLab')
      create(:user, email: 'hello@citizenlab.co', first_name: 'Hello')
      create(:user, email: 'moderator@govocal.com', first_name: 'Customized')
    end
    Tenant.find_by(host: 'test2.govocal.com').switch do
      create(:user, email: 'moderator@citizenlab.co', first_name: 'Citizenlab')
      create(:user, email: 'moderator@govocal.com', first_name: 'citizenlab')
    end

    Rake::Task['gv_transition:rename_profile'].invoke

    Tenant.find_by(host: 'test1.govocal.com').switch do
      expect(User.find_by(email: 'moderator@citizenlab.co').first_name).to eq('Go Vocal')
      expect(User.find_by(email: 'hello@citizenlab.co').first_name).to eq('Hello')
      expect(User.find_by(email: 'moderator@govocal.com').first_name).to eq('Customized')
    end

    Tenant.find_by(host: 'test2.govocal.com').switch do
      expect(User.find_by(email: 'moderator@citizenlab.co').first_name).to eq('Go Vocal')
      expect(User.find_by(email: 'moderator@govocal.com').first_name).to eq('Go Vocal')
    end
  end
end
