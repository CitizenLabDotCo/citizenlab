require 'rails_helper'


RSpec.describe Permission, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:permission)).to be_valid
    end
  end

  describe 'groups_inclusion' do
  	it 'returns expected output' do
  		birthyear = create(:custom_field_number, title_multiloc: {'en' => 'Birthyear?'}, key: 'birthyear', code: 'birthyear')
  		clsebi = create(:user, first_name: 'Sebi', email: 'sebi@citizenlab.co', birthyear: 1992)
  		supersebi = create(:user, first_name: 'Sebi', email: 'supersebi@hotmail.com')
  		clkoen = create(:user, first_name: 'Koen', email: 'koen@citizenlab.co', birthyear: 1987)
  		flupke = create(:user, first_name: 'Flupke', birthyear: 1930)
  		cl_veterans = create(:smart_group, rules: [
        {
        	ruleType: 'email', 
        	predicate: 'ends_on', 
        	value: 'citizenlab.co'
        },
        {
        	ruleType: 'custom_field_number', 
        	customFieldId: birthyear.id,
        	predicate: 'is_smaller_than_or_equal', 
        	value: 1988
        }
      ])
      sebis = create(:group)
      sebis.add_member clsebi
      sebis.add_member supersebi
  		permission = create(:permission, permitted_by: 'groups', groups: [sebis, cl_veterans])

  		expect(permission.groups_inclusion(flupke)).to match [
  			{
  				id: sebis.id, 
  				title_multiloc: sebis.title_multiloc, 
  				membership_type: 'manual', 
  				inclusion: false, 
  				rules: []
  			}, 
  			{
  				id: cl_veterans.id, 
  				title_multiloc: cl_veterans.title_multiloc, 
  				membership_type: 'rules', 
  				inclusion: false, 
  				rules: [
  					{
  						rule: {
  							"ruleType" => "email", 
  							"predicate" => "ends_on", 
  							"value" => "citizenlab.co"
  						}, 
  						inclusion: false
  					}, 
  					{
  						rule: {
  							"ruleType" => "custom_field_number", 
  							"customFieldId" => birthyear.id, 
  							"predicate" => "is_smaller_than_or_equal", 
  							"value" => 1988
  						}, 
  						inclusion: true
  					}
  					]
  				}
  			]
  		expect(permission.groups_inclusion(clsebi)).to match [
  			{
  				id: sebis.id, 
  				title_multiloc: sebis.title_multiloc, 
  				membership_type: 'manual', 
  				inclusion: true, 
  				rules: []
  			}, 
  			{
  				id: cl_veterans.id, 
  				title_multiloc: cl_veterans.title_multiloc, 
  				membership_type: 'rules', 
  				inclusion: false, 
  				rules: [
  					{
  						rule: {
  							"ruleType" => "email", 
  							"predicate" => "ends_on", 
  							"value" => "citizenlab.co"
  						}, 
  						inclusion: true
  					}, 
  					{
  						rule: {
  							"ruleType" => "custom_field_number", 
  							"customFieldId" => birthyear.id, 
  							"predicate" => "is_smaller_than_or_equal", 
  							"value" => 1988
  						}, 
  						inclusion: false
  					}
  					]
  				}
  			]
  		expect(permission.groups_inclusion(clkoen)).to match [
  			{
  				id: sebis.id, 
  				title_multiloc: sebis.title_multiloc, 
  				membership_type: 'manual', 
  				inclusion: false, 
  				rules: []
  			}, 
  			{
  				id: cl_veterans.id, 
  				title_multiloc: cl_veterans.title_multiloc, 
  				membership_type: 'rules', 
  				inclusion: true, 
  				rules: [
  					{
  						rule: {
  							"ruleType" => "email", 
  							"predicate" => "ends_on", 
  							"value" => "citizenlab.co"
  						}, 
  						inclusion: true
  					}, 
  					{
  						rule: {
  							"ruleType" => "custom_field_number", 
  							"customFieldId" => birthyear.id, 
  							"predicate" => "is_smaller_than_or_equal", 
  							"value" => 1988
  						}, 
  						inclusion: true
  					}
  					]
  				}
  			]
  	end
  end

  describe 'for_user' do
    before do
      @p1 = create(:project_with_current_phase, phases_config: {sequence: "xcx"}, with_permissions: true)
      @past_phase, @current_phase, @future_phase = @p1.phases.sort_by(&:end_at)
      @p2 = create(:continuous_project, with_permissions: true)
      Permission.all.each{|pm| pm.update!(permitted_by: 'admins_moderators')}
      @permission_everyone = @current_phase.permissions.find_by action: 'posting'
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
      @permission_groups1 = @current_phase.permissions.find_by action: 'commenting'
      @permission_groups1.update!(permitted_by: 'groups', groups: [@g1,@cl_veterans])
      @permission_groups2 = @current_phase.permissions.find_by action: 'voting'
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
  end
end
