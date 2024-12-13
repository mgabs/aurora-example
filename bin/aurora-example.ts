#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuroraExampleStack } from "../lib/aurora-example-stack";
import * as dotenv from "dotenv";

const app = new cdk.App();
dotenv.config();
new AuroraExampleStack(app, "AuroraExampleStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  env: { account: process.env.ACCOUNT_NO, region: process.env.REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
