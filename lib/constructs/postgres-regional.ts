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

export class PostgresRegional extends Construct {
  constructor(scope: Construct, id: string, props: ConstructInterface) {
    super(scope, id);

    // Create an Aurora Serverless v2 cluster
    const auroraCluster = new rds.DatabaseCluster(
      this,
      "AuroraRegionalCluster",
      {
        clusterIdentifier: `${props.name}Cluster`,
        defaultDatabaseName: props.name,
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_16_1,
        }),
        storageEncrypted: true,
        storageEncryptionKey: props.kmsKey,
        writer: rds.ClusterInstance.serverlessV2("instance1", {
          instanceIdentifier: `${props.name}Instance1`,
          publiclyAccessible: false,
          enablePerformanceInsights: true,
        }),
        copyTagsToSnapshot: true,
        credentials: rds.Credentials.fromSecret(props.dbSecret),
        removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
        vpc: props.vpc,
      },
    );

    // Output the database cluster endpoint
    new cdk.CfnOutput(this, `${props.name}Endpoint`, {
      value: auroraCluster.clusterEndpoint.hostname,
    });
  }
}
