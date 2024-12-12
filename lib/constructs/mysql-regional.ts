import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as kms from "aws-cdk-lib/aws-kms";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";

interface ConstructInterface extends cdk.StackProps {
  name: string;
  kmsKey: kms.Key;
  dbSecret: secretsmanager.Secret;
  vpc: ec2.Vpc;
}

export class MysqlRegionalServerless extends Construct {
  constructor(scope: Construct, id: string, props: ConstructInterface) {
    super(scope, id);

    // Create an Aurora MySql Regional Serverless v2 cluster
    const auroraCluster = new rds.DatabaseCluster(
      this,
      "AuroraRegionalCluster",
      {
        engine: rds.DatabaseClusterEngine.auroraMysql({
          version: rds.AuroraMysqlEngineVersion.VER_3_05_2,
        }),
        storageEncryptionKey: props.kmsKey,
        writer: rds.ClusterInstance.serverlessV2(`${props.name}Writer1`, {
          publiclyAccessible: false,
        }),
        serverlessV2MinCapacity: 0.5,
        serverlessV2MaxCapacity: 2,
        readers: [
          rds.ClusterInstance.serverlessV2(`${props.name}Reader1`, {
            scaleWithWriter: true,
          }),
          rds.ClusterInstance.serverlessV2(`${props.name}Reader2`, {
            scaleWithWriter: true,
          }),
        ],
        instanceUpdateBehaviour: rds.InstanceUpdateBehaviour.ROLLING,
        // enableDataApi: true,
        credentials: rds.Credentials.fromSecret(props.dbSecret),
        defaultDatabaseName: props.name,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
        vpc: props.vpc,
        parameterGroup: rds.ParameterGroup.fromParameterGroupName(
          this,
          `${props.name}ParameterGroup`,
          "default.aurora-mysql8.0",
        ),
      },
    );

    // Output the database cluster endpoint
    new cdk.CfnOutput(this, `${props.name}ClusterEndpoint`, {
      value: auroraCluster.clusterEndpoint.hostname,
    });
  }
}
