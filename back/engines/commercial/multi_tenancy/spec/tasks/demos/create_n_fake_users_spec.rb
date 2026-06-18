# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'demos:create_n_fake_users rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['demos:create_n_fake_users'].reenable
    # The task writes its JSON report to the working directory.
    FileUtils.rm_f(Rails.root.join('create_n_fake_users.json'))
  end

  def run_task(host: Tenant.current.host, num_users: 3, locale: 'fr-FR')
    Rake::Task['demos:create_n_fake_users'].invoke(host, num_users.to_s, locale)
  end

  describe 'on a demo tenant' do
    # The default test tenant is 'active' and the model forbids flipping it to 'demo',
    # so stub the lifecycle_stage the guard reads (passing other lookups through).
    before do
      allow_any_instance_of(AppConfiguration).to receive(:settings).and_call_original
      allow_any_instance_of(AppConfiguration)
        .to receive(:settings).with('core', 'lifecycle_stage').and_return('demo')
    end

    it 'creates the requested number of users' do
      expect { run_task(num_users: 3) }.to change(User, :count).by(3)
    end

    it 'creates active, confirmed users with the expected attributes' do
      run_task(num_users: 2, locale: 'nl-NL')

      users = User.order(created_at: :desc).first(2)
      expect(users.size).to eq(2)
      expect(users).to all(have_attributes(
        first_name: be_present,
        last_name: be_present,
        email: be_present,
        locale: 'nl-NL',
        confirmation_required: false,
        email_confirmed_at: be_present
      ))
      expect(users).to all(be_active)
    end

    it 'creates the email confirmation records the after_create callback would' do
      run_task(num_users: 2)

      users = User.order(created_at: :desc).first(2)
      expect(users.size).to eq(2)
      expect(users).to all(have_attributes(email_confirmation: be_present, new_email_confirmation: be_present))
    end

    it 'creates users with unique emails and slugs' do
      run_task(num_users: 5)

      users = User.order(created_at: :desc).first(5)
      expect(users.map(&:email).uniq.size).to eq(5)
      expect(users.map(&:slug).uniq.size).to eq(5)
    end

    it 'aborts when the locale is not enabled on the tenant' do
      expect { run_task(num_users: 3, locale: 'de-DE') }
        .to output(/Locale 'de-DE' is not enabled/).to_stdout
        .and(not_change(User, :count))
    end
  end

  describe 'lifecycle guard' do
    # The default test tenant has lifecycle_stage 'active', and tests run outside the
    # development env, so creation is blocked here.
    it 'refuses to create users on a non-demo tenant outside development' do
      expect { run_task(num_users: 3) }
        .to output(/only allowed on demo platforms/).to_stdout
        .and(not_change(User, :count))
    end
  end

  describe 'argument validation' do
    it 'aborts when no host is given' do
      expect { run_task(host: nil) }.to output(/host, num_users and locale arguments are all required/).to_stdout
    end

    it 'aborts when num_users is zero' do
      expect { run_task(num_users: 0) }
        .to output(/host, num_users and locale arguments are all required/).to_stdout
        .and(not_change(User, :count))
    end

    it 'aborts when no locale is given' do
      expect { run_task(locale: nil) }
        .to output(/host, num_users and locale arguments are all required/).to_stdout
        .and(not_change(User, :count))
    end

    it 'aborts when no tenant matches the host' do
      expect { run_task(host: 'does-not-exist.example.com') }.to output(/No tenant found/).to_stdout
    end
  end
end
# rubocop:enable RSpec/DescribeClass
