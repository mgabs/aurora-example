import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as kms from "aws-cdk-lib/aws-kms";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { MysqlProvisioned } from "./constructs/mysql-provisioned";

export class AuroraExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create a VPC for the database
    const vpc = new ec2.Vpc(this, "AuroraVpc", {
      maxAzs: 2, // Default is all AZs in the region
    });

    const encryptionKey = new kms.Key(this, "DatabaseEncryptionKey", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });

    // Create a Secrets Manager secret for the database credentials
    const dbSecret = new secretsmanager.Secret(this, "DatabaseSecret", {
      secretName: "AuroraDatabaseCredentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "cluster_admin" }),
        generateStringKey: "password",
        excludeCharacters: '/@" ',
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Aurora Postgres Serverless
    // const auroraServerless = new PostgresServerless(this, "AuroraServerless", {
    //   name: "AuroraPostgressServerless",
    //   kmsKey: encryptionKey,
    //   dbSecret,
    //   vpc,
    // });

    // Aurora Postgres Regional Serverless
    // const auroraRegional = new PostgresRegional(this, "AuroraRegional", {
    //   name: "AuroraPostgressRegional",
    //   kmsKey: encryptionKey,
    //   dbSecret,
    //   vpc,
    // });

    // // Aurora Postgres Regional Provisioned
    // const auroraProvisioned = new PostgresProvisioned(this, "AuroraRegional", {
    //   name: "AuroraPostgressProvisioned",
    //   kmsKey: encryptionKey,
    //   dbSecret,
    //   vpc,
    // });

    // // Aurora Mysql Serverless
    // const auroraServerless = new MysqlServerless(this, "AuroraRegional", {
    //   name: "AuroraMySqlServerless",
    //   kmsKey: encryptionKey,
    //   dbSecret,
    //   vpc,
    // });

    // // Aurora Mysql Serverless
    // const auroraRegionalServerless = new MysqlRegionalServerless(
    //   this,
    //   "AuroraRegional",
    //   {
    //     name: "AuroraPostgressRegionalServerless",
    //     kmsKey: encryptionKey,
    //     dbSecret,
    //     vpc,
    //   },
    // );

    // Aurora Mysql Provisioned
    const auroraMysqlProvisioned = new MysqlProvisioned(
      this,
      "AuroraRegional",
      {
        name: "AuroraMyySqlProvisioned",
        kmsKey: encryptionKey,
        dbSecret,
        vpc,
      },
    );

    dbSecret.addRotationSchedule("RotationSchedule", {
      automaticallyAfter: cdk.Duration.days(30),
      hostedRotation: secretsmanager.HostedRotation.postgreSqlSingleUser({
        vpc,
      }),
    });
  }
}
