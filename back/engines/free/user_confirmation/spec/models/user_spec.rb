require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  after(:each) do
    user.clear_changes_information
  end

  it 'is initialized without a confirmation code' do
    expect(user.email_confirmation_code).to be_nil
  end

  describe '#confirmed?' do
    it 'returns false when the user has not yet been confirmed' do
      expect(user.confirmed?).to be false
    end

    it 'returns true after the user has confirmed the account' do
      user.confirm!
      expect(user.confirmed?).to be true
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

  describe '#reset_email' do
    let(:email) { 'new_email@email.com' }

    it 'changes the email' do
      expect { user.reset_email(email) }.to change(user, :email).from(user.email).to(email)
    end

    it 'resets the confirmation code reset count' do
      user.increment_confirmation_code_reset_count!
      user.reload
      expect { user.reset_email(email) }.to change(user, :email_confirmation_code_reset_count).from(1).to(0)
    end

    it 'saves the change to the email' do
      expect { user.reset_email(email) }.to change(user, :saved_change_to_email)
    end

    it 'should save the change to the code reset count' do
      user.increment_confirmation_code_reset_count!
      user.reload
      expect { user.reset_email(email) }.to change(user, :saved_change_to_email_confirmation_code_reset_count?)
    end
  end

  describe '#confirm!' do
    it 'should set email confirmed at' do
      expect { user.confirm! }.to change(user, :saved_change_to_email_confirmed_at?)
    end
  end
end
