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

export class MysqlProvisioned extends Construct {
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
        writer: rds.ClusterInstance.provisioned(`${props.name}Writer1`, {
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.BURSTABLE3,
            ec2.InstanceSize.MEDIUM,
          ),
          publiclyAccessible: false,
        }),
        readers: [
          rds.ClusterInstance.provisioned(`${props.name}Reader1`, {
            promotionTier: 1,
          }),
        ],
        instanceUpdateBehaviour: rds.InstanceUpdateBehaviour.ROLLING,
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
