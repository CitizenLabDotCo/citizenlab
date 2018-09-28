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
end
