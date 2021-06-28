require "rails_helper"

describe SmartGroups::Rules::Role do

  let(:valid_json_rule) {{
    'ruleType' => 'role',
    'predicate' => 'is_admin'
  }}
  let(:valid_rule) { SmartGroups::Rules::Role.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it "fails on a non-existing predicate" do
      json_rule = valid_json_rule.tap{|r| r['predicate']='has_long_toes'}
      expect(SmartGroups::Rules::Role.from_json(json_rule)).to be_invalid
      expect(build(:smart_group, rules: [json_rule])).to be_invalid
    end
  end

  describe "filter" do

    let!(:users) {
      mortals = create_list(:user, 3)
      admins = create_list(:admin, 2)
      moderators = create_list(:project_moderator, 2)
      admin_and_moderator = create(:project_moderator)
      admin_and_moderator.update(roles: admin_and_moderator.roles + [{type: 'admin'}])
      mortals + admins + moderators + [admin_and_moderator]
    }

    it "correctly filters on 'is_admin' predicate" do
      rule = SmartGroups::Rules::Role.new('is_admin')
      expect(rule.filter(User).count).to eq 3
    end

    it "correctly filters on 'not_is_admin' predicate" do
      rule = SmartGroups::Rules::Role.new('not_is_admin')
      expect(rule.filter(User).count).to eq 5
    end

    it "correctly filters on 'is_project_moderator' predicate" do
      rule = SmartGroups::Rules::Role.new('is_project_moderator')
      expect(rule.filter(User).count).to eq 3
    end

    it "correctly filters on 'not_is_project_moderator' predicate" do
      rule = SmartGroups::Rules::Role.new('not_is_project_moderator')
      expect(rule.filter(User).count).to eq 5
    end

    it "correctly filters on 'is_normal_user' predicate" do
      rule = SmartGroups::Rules::Role.new('is_normal_user')
      expect(rule.filter(User).count).to eq 3
    end

    it "correctly filters on 'not_is_normal_user' predicate" do
      rule = SmartGroups::Rules::Role.new('not_is_normal_user')
      expect(rule.filter(User).count).to eq 5
    end

  end

  describe "description_multiloc" do

    let(:role_is_admin_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'is_admin'
    })}
    let(:role_not_is_admin_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'not_is_admin'
    })}
    let(:role_is_project_moderator_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'is_project_moderator'
    })}
    let(:role_not_is_project_moderator_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'not_is_project_moderator'
    })}
    let(:role_is_normal_user_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'is_normal_user'
    })}
    let(:role_not_is_normal_user_rule) {SmartGroups::Rules::Role.from_json({
      'ruleType'      => 'role',
      'predicate'     => 'not_is_normal_user'
    })}

    it "successfully translates different combinations of rules" do
      # Stubbing the translations so the specs don't depend on those.
      I18n.load_path += Dir[Rails.root.join('spec', 'fixtures', 'locales', '*.yml')]

      expect(role_is_admin_rule.description_multiloc).to eq ({
        'en'    => 'Role is admin',
        'fr-FR' => 'Statut est administrateur',
        'nl-NL' => 'Rol is beheerder'
      })
      expect(role_not_is_admin_rule.description_multiloc).to eq ({
        'en'    => 'Role is not admin',
        'fr-FR' => 'Statut n\'est pas administrateur',
        'nl-NL' => 'Rol is niet beheerder'
      })
      expect(role_is_project_moderator_rule.description_multiloc).to eq ({
        'en'    => 'Role is project moderator',
        'fr-FR' => 'Statut est modérateur de projet',
        'nl-NL' => 'Rol is project moderator'
      })
      expect(role_not_is_project_moderator_rule.description_multiloc).to eq ({
        'en'    => 'Role is not project moderator',
        'fr-FR' => 'Statut n\'est pas modérateur de projet',
        'nl-NL' => 'Rol is niet project moderator'
      })
      expect(role_is_normal_user_rule.description_multiloc).to eq ({
        'en'    => 'Role is normal user',
        'fr-FR' => 'Statut est utilisateur normal',
        'nl-NL' => 'Rol is gewone gebruiker'
      })
      expect(role_not_is_normal_user_rule.description_multiloc).to eq ({
        'en'    => 'Role is not normal user',
        'fr-FR' => 'Statut n\'est pas utilisateur normal',
        'nl-NL' => 'Rol is niet gewone gebruiker'
      })
    end
  end

end
