# frozen_string_literal: true

require 'rails_helper'

describe ApplicationPolicy do
  describe '#active?' do
    it 'is false for a nil user' do
      expect(described_class.new(nil, nil).send(:active?)).to be_falsey
    end

    it 'is true for an active user' do
      expect(described_class.new(create(:user), nil).send(:active?)).to be true
    end

    it 'is false for a blocked user' do
      blocked = create(:user, block_end_at: 5.days.from_now)
      expect(described_class.new(blocked, nil).send(:active?)).to be false
    end
  end

  describe '#admin?' do
    it 'is falsey for a nil user' do
      expect(described_class.new(nil, nil).send(:admin?)).to be_falsey
    end

    it 'is false for a normal user' do
      expect(described_class.new(create(:user), nil).send(:admin?)).to be false
    end

    it 'is true for an admin' do
      expect(described_class.new(create(:admin), nil).send(:admin?)).to be true
    end
  end

  describe '#active_admin_or_moderator?' do
    it 'is falsey for a nil user' do
      expect(described_class.new(nil, nil).send(:active_admin_or_moderator?)).to be_falsey
    end

    it 'is false for a normal user' do
      expect(described_class.new(create(:user), nil).send(:active_admin_or_moderator?)).to be false
    end

    it 'is true for an admin' do
      expect(described_class.new(create(:admin), nil).send(:active_admin_or_moderator?)).to be true
    end

    it 'is true for a project moderator' do
      expect(described_class.new(create(:project_moderator), nil).send(:active_admin_or_moderator?)).to be true
    end

    it 'is false for a blocked admin' do
      blocked = create(:admin, block_end_at: 5.days.from_now)
      expect(described_class.new(blocked, nil).send(:active_admin_or_moderator?)).to be false
    end
  end

  describe '#owner?' do
    let(:user) { create(:user) }
    let(:record) { instance_double('Record', user_id: user.id) }

    it 'is true when the record belongs to the user' do
      expect(described_class.new(user, record).send(:owner?)).to be true
    end

    it 'is false when the record belongs to another user' do
      other_record = instance_double('Record', user_id: create(:user).id)
      expect(described_class.new(user, other_record).send(:owner?)).to be false
    end

    it 'is falsey for a nil user' do
      expect(described_class.new(nil, record).send(:owner?)).to be_falsey
    end
  end

  describe '#can_moderate?' do
    let!(:space) { create(:space) }
    let!(:project) { create(:project, space: space) }
    let!(:folder) { create(:project_folder, projects: [project], space: space) }

    it 'is falsey for a nil user' do
      expect(described_class.new(nil, project).send(:can_moderate?)).to be_falsey
    end

    it 'is false for a normal user' do
      expect(described_class.new(create(:user), project).send(:can_moderate?)).to be false
    end

    it 'is true for an admin' do
      expect(described_class.new(create(:admin), project).send(:can_moderate?)).to be true
    end

    it 'is true for a project moderator who moderates the project' do
      moderator = create(:project_moderator, projects: [project])
      expect(described_class.new(moderator, project).send(:can_moderate?)).to be true
    end

    it 'is false for a project moderator who does not moderate the project' do
      moderator = create(:project_moderator)
      expect(described_class.new(moderator, project).send(:can_moderate?)).to be false
    end

    it 'is true for a folder moderator who moderates the project via the folder' do
      moderator = create(:project_folder_moderator, project_folders: [folder])
      expect(described_class.new(moderator, project).send(:can_moderate?)).to be true
    end

    it 'is true for a space moderator who moderates the project via the space' do
      moderator = create(:space_moderator, spaces: [space])
      expect(described_class.new(moderator, project).send(:can_moderate?)).to be true
    end

    it 'is false for a blocked admin' do
      blocked = create(:admin, block_end_at: 5.days.from_now)
      expect(described_class.new(blocked, project).send(:can_moderate?)).to be false
    end
  end
end
