# serverless-tag-sqs
Serverless plugin to tag SQS - Simple Queue Service

## Installation

Install the plugin via <a href="https://docs.npmjs.com/cli/install">NPM</a>

```
npm install serverless-tag-sqs
```

## Usage

In Serverless template:

```
custom:
  sqsTags:
    TagName1: TagValue1
    TagName2: TagValue2

plugins: 
  - serverless-tag-sqs

```