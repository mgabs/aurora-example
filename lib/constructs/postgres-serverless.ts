import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as kms from "aws-cdk-lib/aws-kms";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";

interface ConstructInterface extends cdk.StackProps {
  name: string;
  kmsKey: kms.Key;
  dbSecret: secretsmanager.Secret;
  vpc: ec2.Vpc;
}

export class PostgresServerless extends Construct {
  constructor(scope: Construct, id: string, props: ConstructInterface) {
    super(scope, id);

    // Create an Aurora Serverless v2 cluster
    const auroraCluster = new rds.ServerlessCluster(
      this,
      "AuroraServerlessCluster",
      {
        engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
        storageEncryptionKey: props.kmsKey,
        enableDataApi: true,
        credentials: rds.Credentials.fromSecret(props.dbSecret),
        defaultDatabaseName: props.name,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
        vpc: props.vpc,
        parameterGroup: rds.ParameterGroup.fromParameterGroupName(
          this,
          `${props.name}ParameterGroup`,
          "default.aurora-postgresql13",
        ),
        scaling: {
          autoPause: cdk.Duration.minutes(5),
          minCapacity: rds.AuroraCapacityUnit.ACU_2,
          maxCapacity: rds.AuroraCapacityUnit.ACU_4,
        },
      },
    );

    // Output the database cluster endpoint
    new cdk.CfnOutput(this, `${props.name}ClusterEndpoint`, {
      value: auroraCluster.clusterEndpoint.hostname,
    });
  }
}
