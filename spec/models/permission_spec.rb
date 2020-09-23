require 'rails_helper'


RSpec.describe Permission, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:permission)).to be_valid
    end
  end

  describe 'participation_conditions' do
  	it 'returns expected output' do
      birthyear = create(:custom_field_number, title_multiloc: {'en' => 'Birthyear?'}, key: 'birthyear', code: 'birthyear')

  		sebi = create(:user, first_name: 'Sebi', email: 'sebi@citizenlab.co', birthyear: 1992)
      koen = create(:user, first_name: 'Koen', email: 'koen@citizenlab.co', birthyear: 1987)
      flupke = create(:user, first_name: 'Flupke', email: 'flupke@gmail.com', birthyear: 1930)

      email_rule = {
        'ruleType' => 'email', 
        'predicate' => 'ends_on', 
        'value' => 'citizenlab.co'
      }
      bday_rule = {
        'ruleType' => 'custom_field_number', 
        'customFieldId' => birthyear.id,
        'predicate' => 'is_smaller_than_or_equal', 
        'value' => 1988
      }
      verified_rule = {
        'ruleType' => 'verified', 
        'predicate' => 'is_verified'
      }

      manual = create(:group)
      manual.add_member create(:user)
      cl_verified = create(:smart_group, rules: [email_rule, verified_rule])
      veterans = create(:smart_group, rules: [bday_rule])
      verified = create(:smart_group, rules: [verified_rule])

      permission = create(:permission, permitted_by: 'groups', groups: [cl_verified, manual, verified, veterans])

      service = SmartGroupsService.new
  		expect(permission.participation_conditions).to match [
        [
          service.parse_json_rule(email_rule).description_multiloc
        ],
        [
          service.parse_json_rule(bday_rule).description_multiloc
        ]
      ]
  	end
  end

  describe 'for_user' do
    before do
      @p1 = create(:project_with_current_phase, phases_config: {sequence: "xcx"}, with_permissions: true)
      @past_phase, @current_phase, @future_phase = @p1.phases.sort_by(&:end_at)
      @p2 = create(:continuous_project, with_permissions: true)
      Permission.all.each{|pm| pm.update!(permitted_by: 'admins_moderators')}
      @permission_everyone = @current_phase.permissions.find_by action: 'posting_idea'
      @permission_everyone.update!(permitted_by: 'everyone')
      @g1 = create(:group)
      @g2 = create(:group)
      @cl_veterans = create(:smart_group, rules: [
        {
          ruleType: 'email', 
          predicate: 'ends_on', 
          value: 'citizenlab.co'
        },
        {
          ruleType: 'custom_field_number', 
          customFieldId: create(:custom_field_number, title_multiloc: {'en' => 'Birthyear?'}, key: 'birthyear', code: 'birthyear').id,
          predicate: 'is_smaller_than_or_equal', 
          value: 1988
        }
      ])
      @permission_groups1 = @current_phase.permissions.find_by action: 'commenting_idea'
      @permission_groups1.update!(permitted_by: 'groups', groups: [@g1,@cl_veterans])
      @permission_groups2 = @current_phase.permissions.find_by action: 'voting_idea'
      @permission_groups2.update!(permitted_by: 'groups', groups: [@g2])
    end
    it 'returns all permissions for admins' do
      expect(Permission.for_user(create(:admin)).count).to eq Permission.count
    end

    it 'returns all permissions of a project for a moderator' do
      expect(@p1.permissions.for_user(create(:moderator, project: @p1)).count).to eq @p1.permissions.count
    end

    it 'returns permissions for everyone to mortal users' do
      expect(Permission.for_user(create(:user)).count).to eq 1
    end

    it 'returns the group permissions for group members' do
      member = create(:user, birthyear: 1992)
      @g1.add_member member
      @g1.save!
      expect(Permission.for_user(member).count).to eq 2
    end

    it 'returns the group permissions for a user in multiple groups, without errors' do
      member = create(:user, birthyear: 1992)
      @g1.add_member member
      @g1.save!
      @g2.add_member member
      @g2.save!
      expect(Permission.for_user(member).count).to eq 3
    end
  end
end
