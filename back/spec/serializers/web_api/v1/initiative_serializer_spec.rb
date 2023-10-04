# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::InitiativeSerializer do
  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Thomas', last_name: 'Anderson') }

    it 'should abbreviate the author name' do
      jane_initiative = create(:initiative, author: jane)
      last_name = described_class
        .new(jane_initiative, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane D.'
    end

    it 'should not abbreviate user names for admins' do
      jane_initiative = create(:initiative, author: jane)
      last_name = described_class
        .new(jane_initiative, params: { current_user: admin })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Jane Doe'

      admin_initiative = create(:initiative, author: admin)
      last_name = described_class
        .new(admin_initiative, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :author_name)
      expect(last_name).to eq 'Thomas Anderson'
    end
  end

  context 'when current_user has reacted to initiative' do
    let(:initiative) { create(:initiative) }
    let(:user) { create(:user) }
    let!(:reaction) { create(:reaction, user: user, reactable: initiative) }

    it 'should include details of reaction' do
      reaction_id = described_class
        .new(initiative, params: { current_user: user })
        .serializable_hash
        .dig(:data, :relationships, :user_reaction, :data, :id)
      expect(reaction_id).to eq reaction.id
    end
  end

  context 'when current_user has not reacted to initiative' do
    let(:initiative) { create(:initiative) }
    let(:user) { create(:user) }

    context 'when current_user has verification associated with initiative reaction' do
      let(:verification) { create(:verification, user: user) }
      let!(:reaction) { create(:reaction, user: user, reactable: initiative) }
      let!(:reactions_verifications_hashed_uid) do
        create(
          :reactions_verifications_hashed_uid,
          reaction: reaction,
          verification_hashed_uid: verification.hashed_uid
        )
      end

      it 'should include details of associated reaction' do
        reaction_id = described_class
          .new(initiative, params: { current_user: user })
          .serializable_hash
          .dig(:data, :relationships, :user_reaction, :data, :id)
        expect(reaction_id).to eq reaction.id
      end
    end

    context 'when current_user has no verification associated with initiative reaction' do
      # Create a reaction that is associated with a different user's verification, to be sure.
      let(:other_user) { create(:user) }
      let(:verification) { create(:verification, user: other_user) }
      let!(:reaction) { create(:reaction, user: other_user, reactable: initiative) }
      let!(:reactions_verifications_hashed_uid) do
        create(
          :reactions_verifications_hashed_uid,
          reaction: reaction,
          verification_hashed_uid: verification.hashed_uid
        )
      end

      it 'should not include details of any reaction' do
        user_reaction_data = described_class
          .new(initiative, params: { current_user: user })
          .serializable_hash
          .dig(:data, :relationships, :user_reaction, :data)
        expect(user_reaction_data).to be_nil
      end
    end
  end

  context 'when serializing internal comments count of initiative' do
    let(:initiative) { create(:initiative) }

    before do
      create_list(:internal_comment, 2, post: initiative)
      initiative.reload
    end

    context 'when current user is nil (visitor)' do
      it 'should not include internal comments count' do
        expect(internal_comments_count_for_current_user(initiative, nil)).to be_nil
      end
    end

    context 'when current user is regular user' do
      it 'should not include internal comments count' do
        expect(internal_comments_count_for_current_user(initiative, create(:user))).to be_nil
      end
    end

    context 'when current user is admin' do
      it 'should include internal comments count' do
        expect(internal_comments_count_for_current_user(initiative, create(:admin))).to eq 2
      end
    end
  end

  context 'when cosponsors of initiative exist' do
    let(:initiative) { create(:initiative) }
    let(:current_user) { create(:user) }
    let(:cosponsor) { create(:user) }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, current_user) }
    let(:cosponsor_display_name) { name_service.display_name!(cosponsor) }
    let!(:_cosponsorship) { create(:cosponsors_initiative, initiative: initiative, user: cosponsor) }

    it 'should include cosponsorships' do
      expect(cosponsorships(initiative, current_user).first[:user_id]).to eq cosponsor.id
      expect(cosponsorships(initiative, current_user).first[:name]).to eq cosponsor_display_name
    end

    it 'should include cosponsors' do
      expect(cosponsors(initiative, current_user).size).to eq 1
      expect(cosponsors(initiative, current_user).first[:id]).to eq cosponsor.id
    end
  end

  def internal_comments_count_for_current_user(initiative, current_user)
    described_class
      .new(initiative, params: { current_user: current_user })
      .serializable_hash
      .dig(:data, :attributes, :internal_comments_count)
  end

  def cosponsors(initiative, current_user)
    described_class
      .new(initiative, params: { current_user: current_user })
      .serializable_hash
      .dig(:data, :relationships, :cosponsors, :data)
  end

  def cosponsorships(initiative, current_user)
    described_class
      .new(initiative, params: { current_user: current_user })
      .serializable_hash
      .dig(:data, :attributes, :cosponsorships)
  end
end
