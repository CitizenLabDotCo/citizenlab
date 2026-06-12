# Access rights interface design

## Overview

I created an empty component for you to implement a design. It lives in front/app/components/AccessRightsDesign/index.tsx.

I need you to design an interface. This interface is used to set fine-grained access rights based properties of users. It is also a place to configure which other types of data should be collected from the user. The 'access rights' part is captured by the headers 'Authentication' and 'Groups' below, the data collection part by 'PII' and 'demographics'. I am now going to describe what should be in the interface. I want to make clear that the goal is not to follow everything I say literally: I want to you to challenge me on decisions, ask more for information, and if possible propose a better solution. So if you think there is a completely different way this can be structured, feel free to suggest it. Same for the wording (although the term 'confirmed' for email and phone number is a must, the word 'verified' is reserved for identity verification, see below)

## Interface structure

### Authentication

Here the user can select kind of authentication is required for this action. There are three types of authentication that you can apply:
- Confirmed email
- Confirmed phone number (through a text message with an OTP)
- Through identity verification (an external api or omniauth integration that verifies your identity through an external database, often run by a government)

The user can choose zero, one, or more of these methods. When choosing zero methods, users without accounts can participate as well.

It should also be possible to select how long ago this attribute must have been confirmed. E.g. if you choose 1 week for 'confirmed email', and you last confirmed your email 2 weeks ago, the platform will send you another OTP that you need to enter before you are allowed to participate.

### Groups

The user can limit access to this action to certain user groups. Groups can be created manually or as 'smart groups' based on attributes of users. But don't worry too much about that, just know that we need to be able to select one or more groups which works as an 'OR' (e.g. user can be in this group or in this group, either is fine).

### PII

The following PII fields should be configurable:

- First name and last name (should be toggle-able as a pair)
- Password (if enabled, user needs to have a password set to their account. Bit of a weird requirement but needed in order to migrate from the current situation without changing behavior)

Obviously it is also possible to require none of these.

### Demographics

There are globally configured demographic fields (e.g. gender, birthyear) which are shared between all actions accross the platform. Here you can select which demographic fields users need to fill out before they can take an action. We can also configure here if these demographic fields are required or optional to fill out.

Obviously it is also possible to require none of these.

## Tricky parts

- Which authentication methods are available will depend on other configurations. For example, if the `password_login` setting is not enabled (see back/config/schemas/settings.schema.json.erb), we cannot provide the 'confirmed email' method. However, in practice this setting is almost always enabled. The same is not true for confirmed phone number of identity verification though- these methods are more rare.
- While it seems like the user can select all kinds of combinations of settings, in practice this is not true. For example, if no authentication is chosen, we have no way to store a user's PII or demographics. So in this case, those options need to be blocked out.

## Other notes

The interface is pretty complex, but should be compact and multiple should fit on a page. The whole interface should be collapsible, but maybe certain elements of it should also be collapsible / only visible through a modal or something- so that it does not overwhelm the user. I let you decide exactly what is the best approach here.

If you want an example of an existing interface that does something like this already, see front/app/components/admin/ActionForm/ActionFormDefault.tsx. However, I am specifically asking you to design something from scratch because the existing component is too big and overwhelming and I am looking for fresh new ideas on how to approach this.
