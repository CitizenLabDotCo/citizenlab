import { RuleEffect } from '@jsonforms/core';

import { getFormSchemaAndData, isValidData, customAjv } from './utils';

describe('getFormSchemaAndData', () => {
  it('should return the same schema and data if no elements are hidden', () => {
    const schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: [],
    };

    const uiSchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
        },
        {
          type: 'Control',
          scope: '#/properties/age',
        },
      ],
    };

    const data = {
      name: 'John',
      age: 30,
    };

    const [resultSchema, resultData] = getFormSchemaAndData(
      schema,
      uiSchema,
      data,
      customAjv
    );

    expect(resultSchema).toEqual(schema);
    expect(resultData).toEqual(data);
  });

  it('should only validate draft survey data against pages up to and including last completed page', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        what_is_your_name_6v5: {
          type: 'string',
        },
        what_is_your_email_address_ad9: {
          type: 'string',
        },
        are_you_responding_on_behalf_of_an_organisation_c4q: {
          type: 'string',
          enum: ['yes_5rv', 'no_7w4'],
        },
        which_category_best_describes_you_awb: {
          type: 'string',
          enum: ['1_na7', '2_ib9', '3_nab'],
        },
        if_other_please_specify_ngz: {
          type: 'string',
        },
        if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k:
          {
            type: 'string',
            enum: [
              'skip_to_section_three_jcp',
              'no_i_would_not_like_to_skip_the_next_section_yvb',
            ],
          },
        which_category_best_describes_your_organisation_kdf: {
          type: 'string',
          enum: ['1_ja7', '2_mwr', '3_ap3'],
        },
        if_other_please_specify_cb5: {
          type: 'string',
        },
        if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_copy_fh6:
          {
            type: 'string',
            enum: [
              'skip_to_section_three_czi',
              'no_i_would_not_like_to_skip_the_next_section_yj1',
            ],
          },
      },
      required: [
        'are_you_responding_on_behalf_of_an_organisation_c4q',
        'which_category_best_describes_you_awb',
        'if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
        'if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_copy_fh6',
      ],
    };

    const uiSchema = {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: 'idea',
      },
      elements: [
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '4407e027-62a1-49ea-9fb5-09e4cb446308',
            title: 'About you',
            description: '',
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/what_is_your_name_6v5',
              label: 'What is your name',
              options: {
                description: '',
                input_type: 'text',
                isAdminField: false,
                hasRule: false,
                transform: 'trim_on_blur',
              },
            },
            {
              type: 'Control',
              scope: '#/properties/what_is_your_email_address_ad9',
              label: 'What is your email address',
              options: {
                description: '',
                input_type: 'text',
                isAdminField: false,
                hasRule: false,
                transform: 'trim_on_blur',
              },
            },
            {
              type: 'Control',
              scope:
                '#/properties/are_you_responding_on_behalf_of_an_organisation_c4q',
              label: 'Are you responding on behalf of an organisation?',
              options: {
                description: '',
                input_type: 'select',
                enumNames: ['Yes', 'No'],
                isAdminField: false,
                hasRule: true,
              },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '2eb13160-fd2e-4867-bed4-89442cd2c108',
            title: '',
            description: '',
          },
          elements: [
            {
              type: 'Control',
              scope: '#/properties/which_category_best_describes_you_awb',
              label: 'Which category best describes you?',
              options: {
                description: '',
                input_type: 'select',
                enumNames: ['1', '2', '3'],
                isAdminField: false,
                hasRule: true,
              },
            },
            {
              type: 'Control',
              scope: '#/properties/if_other_please_specify_ngz',
              label: 'If other, please specify',
              options: {
                description: '',
                input_type: 'text',
                isAdminField: false,
                hasRule: false,
                transform: 'trim_on_blur',
              },
            },
            {
              type: 'Control',
              scope:
                '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
              label:
                'If you have read the consultation document you may wish to skip to section three.',
              options: {
                description: '',
                input_type: 'select',
                enumNames: [
                  'Skip to section three',
                  'No, I would not like to skip the next section',
                ],
                isAdminField: false,
                hasRule: true,
              },
            },
          ],
          ruleArray: [
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/are_you_responding_on_behalf_of_an_organisation_c4q',
                schema: {
                  enum: ['yes_5rv'],
                },
              },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '23011036-8889-4771-882b-9d0cc769ae99',
            title: '',
            description: '',
          },
          elements: [
            {
              type: 'Control',
              scope:
                '#/properties/which_category_best_describes_your_organisation_kdf',
              label: 'Which category best describes your organisation?',
              options: {
                description: '',
                input_type: 'select',
                enumNames: ['1', '2', '3'],
                isAdminField: false,
                hasRule: false,
              },
            },
            {
              type: 'Control',
              scope: '#/properties/if_other_please_specify_cb5',
              label: 'If other, please specify',
              options: {
                description: '',
                input_type: 'text',
                isAdminField: false,
                hasRule: false,
                transform: 'trim_on_blur',
              },
            },
            {
              type: 'Control',
              scope:
                '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_copy_fh6',
              label:
                'If you have read the consultation document you may wish to skip to section three. (Copy)',
              options: {
                description: '',
                input_type: 'select',
                enumNames: [
                  'Skip to section three',
                  'No, I would not like to skip the next section',
                ],
                isAdminField: false,
                hasRule: true,
              },
            },
          ],
          ruleArray: [
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['1_na7'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['2_ib9'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['3_nab'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['4_lv7'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['5_8wr'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['6_ya5'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['7_i3j'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['8_b8t'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope: '#/properties/which_category_best_describes_you_awb',
                schema: {
                  enum: ['9_qng'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
                schema: {
                  enum: ['skip_to_section_three_jcp'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
                schema: {
                  enum: ['no_i_would_not_like_to_skip_the_next_section_yvb'],
                },
              },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '25909ea3-6925-4489-8a6b-1709a05351e1',
            title: 'Section One: About the standards ',
            description:
              '<p><em>Please note:</em> <em>The following paragraph numbers mirror the PDF version of the consultation document for ease of reference. Paragraphs 1-10 have been included in the consultation homepage. </em></p><p><em>You can resize the comments boxes by dragging the bottom right corner down. To navigate through the survey please use the \'next\' and \'previous\' tabs only. Clicking \'go back\' will redirect you back to the start of the survey and the responses entered so far will not be saved.</em></p><p>11. As the regulator for the optical professions in the UK, we have statutory responsibility for setting standards for optometrists, dispensing opticians, optical students, and optical businesses. We set the following standards:</p><ul>\n<li>Standards of Practice for Optometrists and Dispensing Opticians</li>\n<li>Standards for Optical Students</li>\n<li>Standards for Optical Businesses</li>\n</ul><p>12. These standards are applicable to all optometrists and dispensing opticians, whether students or fully qualified, and wherever they practise. As a result, the standards must be overarching, and are not prescriptive about how registrants should meet the standards. Registrants need to use their professional judgement to decide how they will meet the standards. The introductory text provides further context to the standards; however, it is the standards themselves which registrants must meet.</p><p>13. All the standards set by the GOC must be set for reasons of protecting the public and promoting and maintaining public confidence in the optical professions, in line with our statutory objectives. There must therefore be a rational link between any standards set, public protection and public confidence. The standards we set must also represent the minimum action required from our registrants (rather than something aspirational), below which fitness to practise action may be needed if the registrant does not meet those standards. Further details on what is meant by ‘fitness to practise’ can be found here - <a href="https://optical.org/en/raising-concerns/raising-concerns-about-an-optician/what-is-fitness-to-practise/" rel="noreferrer noopener nofollow" target="_blank">What is fitness to practise? | GeneralOpticalCouncil</a></p><p>14. Registrants are professionally accountable and personally responsible for their practice and for what they do, or do not do. Registrants must always be able to justify their decisions and actions.</p><p>15. The Standards for Optical Businesses apply to all businesses we register. As a healthcare provider, an optical business has a responsibility to ensure the care and safety of patients and the public, and to uphold professional standards. Business registrants are expected to apply their professional judgement and consider how to apply the standards within the context of their business.</p><p>16. Complying with the standards will enable businesses to assist, encourage and support individual optometrists, dispensing opticians, and students to comply with their individual professional standards, and in doing so, ensure they are providing good quality patient care and promoting professionalism.</p><p>17. We are only proposing consequential changes to the business standards and intend to begin a full review of these standards after this review is complete.</p>',
          },
          elements: [],
          ruleArray: [
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
                schema: {
                  enum: ['skip_to_section_three_jcp'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_copy_fh6',
                schema: {
                  enum: ['skip_to_section_three_czi'],
                },
              },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '9a9f91c4-1ffa-48d3-8fee-53294a429f78',
            title: 'Section Two: Reviewing our standards',
            description:
              '<p>18. We began the review of our standards in 2022 with desk-based research. We looked at our standards against those set by other healthcare regulators to identify potential gaps in our standards or areas where our standards could be improved. Following that analysis, we identified the following areas as being ones which required particular consideration:</p><ul>\n<li>social media and online conduct;</li>\n<li>supervision and delegation;</li>\n<li>leadership and professionalism;</li>\n<li>use of digital technologies, including artificial intelligence (AI); and</li>\n<li>maintaining appropriate professional boundaries.</li>\n</ul><p>19. We know that stakeholders are essential to making sure that our standards are set appropriately to deliver safe patient care and reflect current practice. So that we could hear stakeholder views early in the process, we arranged a series of stakeholder conversations between May and July 2023 on each of these topics. We are grateful to all stakeholders who took part in these conversations.</p><p>20. To support our stakeholder conversations, we also looked at research, fitness to practise decisions and enquiries we had received about our standards. We reviewed information from our registrant survey and public perceptions survey, as well as submissions we received to our call for evidence on changes to the Opticians Act. We spoke to education providers, continuing professional development (CPD) providers and members of our fitness to practise panels so that we could understand how our standards are being used and applied.</p><p>21. As a regulator focussed on public protection and upholding public confidence in the optical professions, we also wanted to hear the views of patients and the public on our standards, so we commissioned a piece of qualitative research. The ‘Research on public perceptions of the Standards of Practice for Optometrists and Dispensing Opticians, and Standards for Optical Students’ can be accessed via this link - <a href="https://optical.org/media/nh2g12ry/goc_public-perceptions_report_standards.pdf" rel="noreferrer noopener nofollow" target="_blank">Public and Patient Research</a>.</p><p>22. The stakeholder conversations, research and other engagement activities have given us extremely valuable insights into how the standards are used, as well as any potential gaps in our standards or places they could be strengthened. Our starting point is that the existing standards are generally considered to work well and therefore we are only proposing to make limited changes where necessary. Further, any proposed revisions are consistent with the broad, outcomes-focused design of the existing standards.</p><p>23. Below are the key themes arising from all the engagement:</p><ul>\n<li>the importance of equality, diversity, and inclusion (EDI) in relation to both patients and registrants;</li>\n<li>the importance of effective communication with patients;</li>\n<li>confidentiality of patient data;</li>\n<li>leadership and professionalism;</li>\n<li>the use of digital technologies, including AI, in delivering patient care;</li>\n<li>the importance of maintaining professional boundaries with patients and colleagues;</li>\n<li>the use of social media and appropriate online conduct;</li>\n<li>supervision of students and non-registered colleagues, and the use of delegation;</li>\n<li>how the optical professions can support patients in vulnerable circumstances;</li>\n<li>the need for guidance to help registrants understand and apply the standards;</li>\n<li>the balance between setting standards that can be applied in all settings and providing sufficient detail to enable registrants to interpret the standards; and</li>\n<li>the extent to which GOC’s standards align with standards set by other healthcare regulators.</li>\n</ul>',
          },
          elements: [],
          ruleArray: [
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_l7k',
                schema: {
                  enum: ['skip_to_section_three_jcp'],
                },
              },
            },
            {
              effect: 'HIDE',
              condition: {
                scope:
                  '#/properties/if_you_have_read_the_consultation_document_you_may_wish_to_skip_to_section_three_copy_fh6',
                schema: {
                  enum: ['skip_to_section_three_czi'],
                },
              },
            },
          ],
        },
        {
          type: 'Page',
          options: {
            input_type: 'page',
            id: '0e414233-1533-4c4a-b3b5-66c3674d7bb4',
            title: 'Section Three: Proposed changes to our standards ',
            description:
              '<p>24. We have explained in detail below the reasons why we are making changes to our standards or the introduction to the standards. Changes to our standards fall in the following key areas:</p><ul>\n<li>leadership and professionalism;</li>\n<li>care of patients in vulnerable circumstances;</li>\n<li>effective communication;</li>\n<li>use of digital technologies, including AI*;</li>\n<li>supervision and delegation;</li>\n<li>equality, diversity, and inclusion;</li>\n<li>social media, online conduct, and consent;</li>\n<li>maintaining appropriate professional boundaries;</li>\n<li>registrant health; and</li>\n<li>a small number of minor changes.</li>\n</ul><p>25. We have provided full sets of each of the standards, showing the changes we have proposed, separately via weblinks on the consultation homepage.</p><h3>How we refer to our standards</h3><p>26. Throughout this document we will refer to specific standards that have been revised using the standard number, for example, standard 6.1. We recognise that the numbering in the Standards of Practice for Optometrists and Dispensing Opticians differs from the numbering within the Standards for Optical Students.</p><p>27. To address this, we refer to the number within the Standards of Practice for Optometrists and Dispensing Opticians first, and then the number within the Standards for Optical Students in brackets afterwards. For example, we have proposed a revision to standard 6.1 (5.1).</p><p>28. When referring to the Standards for Optical Businesses we will simply refer to the relevant standard, for example, standard 1.1.4.</p><p>*For the purposes of this document, where we refer to ‘digital technology’ or ‘digital technologies’, this includes AI.</p>',
          },
          elements: [],
        },
        {
          type: 'Page',
          options: {
            id: 'survey_end',
            title: 'Thanks for participating',
            description:
              "Please submit your answers by selecting 'Submit' below.",
          },
          elements: [],
        },
      ],
    };

    const data = {
      are_you_responding_on_behalf_of_an_organisation_c4q: 'yes_5rv',
      latest_complete_page: 0,
      phase_ids: ['d5b12bd2-7e1b-49fa-897a-400447fafd97'],
      project_id: 'c2d20014-e80d-4dbf-9b61-57b25fcadb4f',
      publication_status: 'draft',
      what_is_your_email_address_ad9: 'Email address',
      what_is_your_name_6v5: 'Name',
    };

    const result = isValidData(schema, uiSchema, data, customAjv, true);

    expect(result).toEqual(true);
  });

  it('should remove the data key from the data returned if field is hidden', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        multiple_choice: {
          type: 'string',
          oneOf: [
            {
              const: 'mangoes',
              title: 'Mangoes',
            },
            {
              const: 'pineapples',
              title: 'Pineapples',
            },
          ],
        },
        number: {
          type: 'number',
        },
      },
      required: ['multiple_choice', 'number'],
    };

    const uiSchema = {
      type: 'Page',
      label: 'Testlabel',
      options: {
        id: 'extra',
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/multiple_choice',
          label: 'Fruits',
          options: {
            description: '',
            isAdminField: false,
          },
        },
        {
          type: 'Control',
          scope: '#/properties/number',
          label: 'Number',
          options: {
            description: '',
            isAdminField: false,
          },
          ruleArray: [
            {
              effect: RuleEffect.SHOW,
              condition: {
                scope: '#/properties/multiple_choice',
                schema: {
                  enum: ['pineapples'],
                },
              },
            },
          ],
        },
      ],
    };

    const data = {
      multiple_choice: 'mangoes',
      number: 45,
    };

    const expectedSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        multiple_choice: {
          type: 'string',
          oneOf: [
            {
              const: 'mangoes',
              title: 'Mangoes',
            },
            {
              const: 'pineapples',
              title: 'Pineapples',
            },
          ],
        },
        number: {
          type: 'number',
        },
      },
      required: ['multiple_choice'],
    };

    const expectedData = {
      multiple_choice: 'mangoes',
    };

    const [resultSchema, resultData] = getFormSchemaAndData(
      schema,
      uiSchema,
      data,
      customAjv
    );

    expect(resultSchema).toEqual(expectedSchema);
    expect(resultData).toEqual(expectedData);
  });
});
