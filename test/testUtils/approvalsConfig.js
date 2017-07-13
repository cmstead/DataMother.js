'use strict';

const approvalsConfigFactory = require('approvals-config-factory');
const approvals = require('approvals');

const approvalsPath = './test/approvals';
const approvalsConfig = approvalsConfigFactory.buildApprovalsConfig({
    reporter: 'kdiff3'
});

module.exports  = approvals.configure(approvalsConfig).mocha(approvalsPath)
