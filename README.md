# Hidden Perspectives – Data Sandbox
## Clone the project
First, clone the project locally and move into the folder. Open your terminal and run:
```sh
$ git clone git@github.com:vogelino/hidden-perspectives-app.git
$ cd hidden-perspectives-data-sandbox
```

## Install the dependencies
You have to install the project's dependencies using [Yarn](https://yarnpkg.com/en/).
```sh
$ yarn install
```

## Configure your environment variables
### Dandelion API
For data preparation we're using the [Entity Extraction API](https://dandelion.eu/docs/api/datatxt/nex/getting-started/) from [Dandelion API](https://dandelion.eu/). Follow their instructions and get a free API Key.

### Graphcool
[Graphcool](https://www.graph.cool/) is an open-source and self-hosted backend-as-a-service to develop serverless GraphQL backends. Create a Graphcool project. You'll need the `project id` and `authorization token` for deploying the data.

### LocationIQ
[Sign up](https://locationiq.com/) and get a developer token. Copy `.env.sample`, rename the file to `.env`. and edit so it matches your credentials.


## Available scripts
### `yarn convertDocumentsAndEvents`

Converts the provided excel sheets and does all the data processing we need for our database schema.

### `yarn prepareDataForGraphcool`

Creates nodes and relations and finally imports them to Graphcool.


## Prepare data

### Directory structure

Create a `data` and `graphcoolData` directories and subdirectories so your folder structure matches the following directory tree:

```sh
.
├── README.md
├── package-lock.json
├── package.json
├── .env.sample
├── .env.sample
├── .gitignore
├── scripts
│   ├── constants.js
│   ├── convertDocumentsAndEvents
│   ├── prepareDataForGraphcool
│   └── utils
│
├── data
│   ├── sheets
│   │   ├── documents
│   │   └── events
│   │
│   ├── original_documents
│   ├── text_files
│   └── json
│       ├── documents
│       ├── entities
│       ├── documents
│       ├── events
│       ├── kind
│       ├── locations
│       └── stakeholder
│
└── graphcoolData
```


- `sheets` – Contains the excel sheets that were provided as dataset
- `original_documents` – The original document PDF's
- `text_files` – Document transcripts
- `json` – The `convertDocumentsAndEvents` scripts save data to this folder
