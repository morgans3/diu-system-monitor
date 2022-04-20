# DIU System Monitor

This codebase is an implementation of Sorry Cypress server for storing results of Automated Tests, and files on Canary-style testing for repeating the automated tests on production environments as a system health monitoring

## System Tests (Cypress)

### Rationale and Objectives

Routine testing of the systems we deploy is essential for a timely and efficient response to errors and ensures minimal downtime. This is crucial to running a clinical system and ensures compliance with best practice (https://aws.amazon.com/blogs/apn/the-6-pillars-of-the-aws-well-architected-framework/).

There are different types of test and different levels of testing. Most tests can fall into a category of either Unit testing or Integration testing: i.e. can a thing work and can things work together.

Whilst the built in testing library Protractor performs a nice role in Angular testing, its most suitable use-case for us is to perform Unit testing. Coding a basic spec.ts file for each component that runs a "can create" test will ensure that the application will build and compile.

However more functional tests can be created for both Unit testing and Integration by using the Cypress library (https://docs.cypress.io/api/table-of-contents). By using this library, we have the added benefit of being able to easily abstract our test files from the codebase itself. This allows us to do more than test during a development sprint or during a deployment pipeline.

By removing the dependency on the codebase for the tests to run, we can carry out Canary-style testing on our live systems (production and development), routinely to ensure all systems are running as expected. This application is designed to provide those routine tests.

### Tests and Structure

All test files are contained in the cypress folder. For information on the usecase for the different folders in this section please refer to the cypress guidance.

Any `global settings` for the application are kept in the `settings.js` file in the root folder of this codebase.

The main elements we are interested when creating and managing the test files are in the `integration`, `fixtures` and `support` folders.

#### Fixtures

The json files in the fixtures folder contain demo data for use during the tests.

#### Support

The files in the support folder include the `commands.js` file. In here are some sections of repeatable code that we use frequently, like the login command. Using custom commands created in this folder will ensure that we avoid coding errors or duplication of work. Please familiarise yourself with the custom commands prior to creating new tests.

#### Integration

This folder is the core files that cypress uses for testing. Any spec.ts files you create in this folder or any of its sub-folders will be used in the testing runs. Please ensure that you use a sensible folder structure when creating new files.

### Instructions for recording tests

- use `npm run test-server` to record tests to a running sorry-cypress server

### Instructions for running locally

- use `npm run test-local` to run the cypress testing locally

## Backend (Sorry-Cypress)

### Instructions for running in the cloud

- TBC

### Instructions for running locally

- Ensure you have the latest Docker and docker-compose installed
- run command `docker-compose -f ./docker-compose.minio.yml up`
- Update etc/hosts file to include: `127.0.0.1 storage` this is to store videos/images
- Further instructions on managing locally can be found here: https://docs.sorry-cypress.dev/guide/get-started and https://docs.sorry-cypress.dev/guide/dashboard-and-api

#### After successfully running docker-compose, we have:

- director service on http://localhost:1234
- API service on http://localhost:4000
- Dashboard running on http://localhost:8080

## Terms of Use

This specific code repository and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence.

The code has been developed and is maintained by the NHS and where possible we will try to adhere to the NHS Open Source Policy (<https://github.com/nhsx/open-source-policy/blob/main/open-source-policy.md>).

It shall remain free to the NHS and all UK public services.

### Contributions

This code has been authored by NHS staff in the Digital Intelligence Unit @ NHS Blackpool CCG.

_This project and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence._
