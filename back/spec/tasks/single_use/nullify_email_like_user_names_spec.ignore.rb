# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:nullify_email_like_user_names rake task' do
  before { load_rake_tasks_if_not_loaded }
  after { Rake::Task['single_use:nullify_email_like_user_names'].reenable }

  def run_task(execute: false)
    Rake::Task['single_use:nullify_email_like_user_names'].invoke(execute ? 'execute' : nil)
  end

  describe 'dry-run mode' do
    it 'does not modify users with email-like names' do
      user = create(:user, first_name: 'someone@example.com', last_name: 'someone@example.com')

      run_task(execute: false)

      user.reload
      expect(user.first_name).to eq('someone@example.com')
      expect(user.last_name).to eq('someone@example.com')
    end
  end

  describe 'execute mode' do
    context 'when only last_name contains @' do
      it 'nullifies last_name and preserves first_name' do
        user = create(:user, first_name: 'John', last_name: 'john@example.com')

        run_task(execute: true)

        user.reload
        expect(user.first_name).to eq('John')
        expect(user.last_name).to be_nil
      end
    end

    context 'when only first_name contains @' do
      it 'nullifies first_name and preserves last_name' do
        user = create(:user, first_name: 'jane@example.com', last_name: 'Doe')

        run_task(execute: true)

        user.reload
        expect(user.first_name).to be_nil
        expect(user.last_name).to eq('Doe')
      end
    end

    context 'when both first_name and last_name contain @' do
      it 'nullifies both' do
        user = create(:user, first_name: 'someone@example.com', last_name: 'someone@example.com')

        run_task(execute: true)

        user.reload
        expect(user.first_name).to be_nil
        expect(user.last_name).to be_nil
      end
    end

    context 'when @ appears anywhere in the name' do
      it 'still nullifies the field' do
        user = create(:user, first_name: 'Bob', last_name: 'Smith@home')

        run_task(execute: true)

        user.reload
        expect(user.first_name).to eq('Bob')
        expect(user.last_name).to be_nil
      end
    end

    context 'when neither name contains @' do
      it 'leaves the user unchanged' do
        user = create(:user, first_name: 'Bob', last_name: 'Smith')

        run_task(execute: true)

        user.reload
        expect(user.first_name).to eq('Bob')
        expect(user.last_name).to eq('Smith')
      end
    end

    context 'with a mix of affected and unaffected users' do
      it 'only updates the affected users' do
        affected = create(:user, first_name: 'x', last_name: 'foo@example.com')
        unaffected = create(:user, first_name: 'Alice', last_name: 'Wonderland')

        run_task(execute: true)

        expect(affected.reload.last_name).to be_nil
        expect(unaffected.reload.first_name).to eq('Alice')
        expect(unaffected.reload.last_name).to eq('Wonderland')
      end
    end

    context 'when user.update! raises' do
      it 'leaves the user unchanged and logs an error' do
        user = create(:user, first_name: 'John', last_name: 'john@example.com')
        allow_any_instance_of(User).to receive(:update!).and_raise('Boom')

        expect { run_task(execute: true) }.to output(/ERROR! Failed to update user/).to_stdout

        expect(user.reload.last_name).to eq('john@example.com')
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
