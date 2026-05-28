const custom_fields = [
  {
    "input_type": "page",
    "logic": {},
    "required": false,
    "enabled": true,
    "title_multiloc": {},
    "key": "page1",
    "code": null,
    "page_layout": "default",
    "page_button_label_multiloc": {},
    "page_button_link": "",
    "include_in_printed_form": true,
    "description_multiloc": {}
  },
  {
    "input_type": "select",
    "logic": {},
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": "Your question",
      "nl-BE": "Jouw vraag",
      "nl-NL": "Jouw vraag",
      "fr-BE": "Votre question"
    },
    "key": "your_question_pzl",
    "code": null,
    "description_multiloc": {},
    "options": [
      {
        "key": "option1",
        "title_multiloc": {
          "en": "Option 1",
          "nl-BE": "Optie 1",
          "nl-NL": "Optie 1",
          "fr-BE": "Option 1"
        },
        "other": false
      },
      {
        "key": "option2",
        "title_multiloc": {
          "en": "Option 2",
          "nl-BE": "Optie 2",
          "nl-NL": "Optie 2",
          "fr-BE": "Option 2"
        },
        "other": false
      }
    ],
    "maximum_select_count": null,
    "minimum_select_count": null,
    "random_option_ordering": false,
    "dropdown_layout": false
  },
  {
    "input_type": "page",
    "logic": {},
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": ""
    },
    "page_layout": "default",
    "page_button_label_multiloc": {},
    "page_button_link": "",
    "include_in_printed_form": true,
    "description_multiloc": {}
  },
  {
    "input_type": "select",
    "logic": {
      "rules": []
    },
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": "Question 2",
      "nl-BE": "Question 2",
      "nl-NL": "Question 2",
      "fr-BE": "Question 2"
    },
    "description_multiloc": {},
    "options": [
      {
        "title_multiloc": {
          "en": "Option A",
          "nl-BE": "Option A",
          "nl-NL": "Option A",
          "fr-BE": "Option A"
        }
      },
      {
        "title_multiloc": {
          "fr-BE": "Option B",
          "nl-NL": "Option B",
          "nl-BE": "Option B",
          "en": "Option B"
        }
      }
    ],
    "maximum_select_count": null,
    "minimum_select_count": null,
    "random_option_ordering": false,
    "dropdown_layout": false
  },
  {
    "input_type": "page",
    "logic": {},
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": ""
    },
    "page_layout": "default",
    "page_button_label_multiloc": {},
    "page_button_link": "",
    "include_in_printed_form": true,
    "description_multiloc": {}
  },
  {
    "input_type": "text",
    "logic": [],
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": "Question 3",
      "nl-BE": "Question 3",
      "nl-NL": "Question 3",
      "fr-BE": "Question 3"
    },
    "description_multiloc": {},
    "min_characters": 2
  },
  {
    "input_type": "page",
    "logic": {},
    "required": false,
    "enabled": true,
    "title_multiloc": {
      "en": "Thank you for sharing your input!",
      "nl-BE": "Bedankt voor het delen van je bijdrage!",
      "nl-NL": "Bedankt voor het delen van je bijdrage!",
      "fr-BE": "Merci pour votre participation !"
    },
    "key": "form_end",
    "code": null,
    "page_layout": "default",
    "page_button_label_multiloc": {},
    "page_button_link": "",
    "include_in_printed_form": false,
    "description_multiloc": {
      "en": "Your input has been successfully submitted.",
      "nl-BE": "Je bijdrage is succesvol ingediend.",
      "nl-NL": "Je bijdrage is succesvol ingediend.",
      "fr-BE": "Votre contribution a été soumise avec succès."
    }
  }
]

export const setSurvey = (cy: Cypress.Chainable, phaseId: string) => {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/phases/${phaseId}/custom_fields/update_all`,
      body: {
        custom_fields,
        form_opened_at: new Date().toISOString(),
        form_save_type: 'manual'
      },
    });
  });
}