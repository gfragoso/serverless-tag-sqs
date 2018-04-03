'use strict';

const _ = require('lodash');

let _sqsService = null;
let _cloudFormationService = null;

class ServerlessSQSTagPlugin {

  get stackName() {
    return `${this.serverless.service.service}-${this.options.stage}`;
  }

  get sqsService() {
    
    if(!_sqsService)
      _sqsService = new this.awsService.sdk.SQS({ region: this.options.region });

    return _sqsService;
  }

  get cloudFormationService() {

    if(!_cloudFormationService)
      _cloudFormationService = new this.awsService.sdk.CloudFormation({ region: this.options.region });

    return _cloudFormationService;
  }

  constructor(serverless, options) {

    this.options = options;
    this.serverless = serverless;
    this.awsService = this.serverless.getProvider('aws');

    this.hooks = {
      'after:deploy:deploy': this.execute.bind(this),
    };
  }

  execute() {
    return this.getStackResources()
      .then(data => this.tagQueues(data))
      .then(data => this.serverless.cli.log(JSON.stringify(data)))
      .catch(err => this.serverless.cli.log(JSON.stringify(err)));    
  }

  getStackResources() {    
    return new Promise((resolve, reject) => {
      this.cloudFormationService.describeStackResources({ StackName: this.stackName }, (err, data) => {
        if (err) return reject(err);        
        resolve(data);             
      });
    });
  }

  tagQueues(data) {    

    const sqsResources = _.filter(data.StackResources, { ResourceType: 'AWS::SQS::Queue' });   

    const promises = _.map(sqsResources, item => {
      return new Promise((resolve, reject) => {

        const params = {
          QueueUrl: item.PhysicalResourceId,
          Tags: this.serverless.service.custom.sqsTags
        };

        this.sqsService.tagQueue(params, (err, apiData) => {
          if(err) return reject(err);
          resolve(`Tagged SQS ${item.LogicalResourceId}`);          
        });
      });
    });

    return Promise.all(promises);
  }  
}

module.exports = ServerlessSQSTagPlugin;
