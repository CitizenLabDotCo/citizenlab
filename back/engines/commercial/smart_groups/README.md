## Adding smart group rules

1. Create your smart group rule in `engines/smart_groups/lib/smart_groups/rules`.

2. Add your new rule to `RULE_TYPE_TO_CLASS` in `engines/smart_groups/app/services/smart_groups/rules_service.rb`.

3. Add a spec to `engines/smart_groups/spec/rules/`.

4. Add your rule to `engines/smart_groups/spec/models/group_spec.rb`.

5. Add rule descriptions by overriding `description_value`, `description_rule_type` and `description_property` as desired, and by adding translations under the `smart_group_rules` key.

6. Add specs for the rule descriptions in the spec file you created in `engines/smart_groups/spec/rules/`.

7. Create a frontend task to support the new smart groups rule.
