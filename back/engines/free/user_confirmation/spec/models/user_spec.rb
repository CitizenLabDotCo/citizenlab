require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { build(:user_with_confirmation) }

  after(:each) do
    user.clear_changes_information
  end

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  it 'is initialized without a confirmation code' do
    expect(user.email_confirmation_code).to be_nil
  end

  describe '#confirmed?' do
    it 'returns false when the user has not yet been confirmed' do
      user.save!
      expect(user.confirmed?).to be false
    end

    it 'returns true after the user has confirmed the account' do
      user.save!
      user.confirm!
      expect(user.reload.confirmed?).to be true
    end

    it 'returns true if the user accepted an invitation' do
      user.update(invite_status: 'accepted')
      expect(user.confirmed?).to be true
    end
  end

  describe '#should_require_confirmation?' do
    it 'returns false if the user is an admin' do
      user.add_role('admin')
      user.save!
      expect(user.should_require_confirmation?).to be false
    end

    it 'returns false if the user is a project moderator', skip: !defined?(ProjectManagement::Engine) do
      user.add_role('project_moderator', 'project_id' => 'some_id')
      user.save!
      expect(user.should_require_confirmation?).to be false
    end

    it 'returns false if the user is a normal user' do
      expect(user.should_require_confirmation?).to be true
    end

    it 'returns false if the user registered with a phone number' do
      enable_phone_login
      user.email = '343938837373'
      user.save!
      expect(user.reload.should_require_confirmation?).to be false
    end
  end

  describe '#confirmation_required?' do
    it 'returns false if the feature is not active' do
      SettingsService.new.deactivate_feature! 'user_confirmation'
      expect(user.confirmation_required?).to be false
    end

    it 'returns false if the user already confirmed their account' do
      SettingsService.new.activate_feature! 'user_confirmation'
      user.save!
      user.confirm!
      expect(user.reload.confirmation_required?).to be false
    end

    it 'returns true if the user has not yet confirmed their account' do
      expect(user.confirmation_required?).to be true
    end
  end

  describe '#confirmation_required' do
    it 'raises a private method error' do
      expect { user.confirmation_required }.to raise_error NoMethodError
    end
  end

  describe '#confirmation_required=' do
    it 'raises a private method error' do
      expect { user.confirmation_required = false }.to raise_error NoMethodError
    end
  end

  describe '#confirmed?' do
    it 'returns false if the user has not yet confirmed their account' do
      expect(user.confirmed?).to be false
    end

    it 'returns true if the user has confirmed their account' do
      user.confirm!
      expect(user.confirmation_required?).to be true
    end
  end

  describe '#reset_confirmation_required' do
    it 'resets the confirmation required field' do
      user.save!
      user.reset_confirmation_required
      expect(user.confirmation_required?).to be true
    end

    it 'does not perform a commit to the db' do
      user.save!
      user.reset_confirmation_required
      expect(user.saved_change_to_confirmation_required?).to be false
    end
  end

  describe '#confirm' do
    it 'sets the email_confirmed_at field' do
      user.save!
      user.confirm
      expect(user.confirmed?).to eq true
    end

    it 'does not perform a commit to the db' do
      user.save!
      user.confirm
      expect(user.reload.confirmed?).to be false
    end
  end

  describe '#reset_confirmed_at' do
    it 'resets the confirmed_at field' do
      user.confirm!
      user.reset_confirmed_at
      expect(user.confirmed?).to be false
    end

    it 'does not perform a commit to the db' do
      user.confirm!
      user.reset_confirmed_at
      expect(user.saved_change_to_confirmation_required?).to be false
    end
  end

  describe '#reset_confirmation_code!' do
    it 'changes the code' do
      expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code)
    end

    it 'increments the reset count' do
      expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
    end

    it 'should save a change to the email confirmation code' do
      expect { user.reset_confirmation_code! }.to change(user, :saved_change_to_email_confirmation_code?)
    end
  end

  describe '#increment_confirmation_retry_count!' do
    it 'increments the retry count' do
      expect { user.increment_confirmation_retry_count! }.to change(user, :email_confirmation_retry_count).from(0).to(1)
    end

    it 'saved the change to the retry count' do
      expect { user.increment_confirmation_retry_count! }.to change(user, :saved_change_to_email_confirmation_retry_count?)
    end
  end

  describe '#increment_confirmation_code_reset_count!' do
    it 'increments the reset count' do
      expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
    end

    it 'saved the change to the reset count' do
      expect { user.reset_confirmation_code! }.to change(user, :saved_change_to_email_confirmation_code_reset_count?)
    end
  end

  describe '#reset_confirmation_code' do
    it 'changes the code' do
      expect { user.reset_confirmation_code }.to change(user, :email_confirmation_code)
    end

    it 'should not save a change to the email confirmation code' do
      expect { user.reset_confirmation_code }.not_to change(user, :saved_change_to_email_confirmation_code?)
    end
  end

  describe '#increment_confirmation_code_reset_count' do
    it 'increments the reset count' do
      expect { user.increment_confirmation_code_reset_count }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
    end

    it 'should not save the change to the reset count' do
      expect { user.increment_confirmation_code_reset_count }.not_to change(user, :saved_change_to_email_confirmation_code_reset_count?)
    end
  end

  describe '#increment_confirmation_retry_count' do
    it 'increments the retry count' do
      expect { user.increment_confirmation_retry_count }.to change(user, :email_confirmation_retry_count).from(0).to(1)
    end

    it 'should not save the change to the retry count' do
      expect { user.increment_confirmation_retry_count }.not_to change(user, :saved_change_to_email_confirmation_retry_count?)
    end
  end

  describe '#reset_email!' do
    let(:email) { 'new_email@email.com' }

    it 'changes the email' do
      expect { user.reset_email!(email) }.to change(user, :email).from(user.email).to(email)
    end

    it 'resets the confirmation code reset count' do
      user.increment_confirmation_code_reset_count!
      user.reload
      expect { user.reset_email!(email) }.to change(user, :email_confirmation_code_reset_count).from(1).to(0)
    end

    it 'saves the change to the email' do
      expect { user.reset_email!(email) }.to change(user, :saved_change_to_email)
    end

    it 'should save the change to the code reset count' do
      user.increment_confirmation_code_reset_count!
      user.reload
      expect { user.reset_email!(email) }.to change(user, :saved_change_to_email_confirmation_code_reset_count?)
    end
  end

  describe '#confirm!' do
    it 'should set email confirmed at' do
      user.save!
      expect { user.confirm! }.to change(user, :saved_change_to_email_confirmed_at?)
    end
  end
end
