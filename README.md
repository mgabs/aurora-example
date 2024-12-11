# CDK Code for Deploying RDS in Different Flavors

The CDK code demonstrates the deployment of Amazon RDS in multiple configurations ("flavors") to suit various use cases. It leverages the AWS Cloud Development Kit (CDK) to define infrastructure as code, simplifying the creation and management of database resources. Here's an overview of the different flavors covered:

1. Aurora Serverless

This configuration deploys an Aurora Serverless cluster, ideal for workloads with unpredictable traffic patterns or sporadic usage.

    Engine: MySQL or PostgreSQL compatible.
    Scaling: Automatically adjusts compute capacity between a minimum and maximum based on load.
    Auto-Pause: Option to pause the cluster after a specified period of inactivity, reducing costs.
    Data API: HTTP-based query support for serverless applications.

Use Case: Serverless applications, development, and testing environments.

2. Standard RDS Instance (MySQL, PostgreSQL, or Other Engines)

This configuration deploys a single RDS instance for workloads requiring a fixed compute capacity.

    Engine: Select from MySQL, PostgreSQL, or other supported engines like MariaDB or Oracle.
    Instance Type: Choose instance sizes (e.g., db.t3.micro) based on application requirements.
    Multi-AZ Support: Optional feature for high availability by deploying standby instances in a different Availability Zone.
    Storage Options: Configurable storage sizes and types (e.g., GP2 or IO1).

Use Case: Applications with steady traffic, where predictable performance is required.

3. Aurora Provisioned Cluster

This configuration creates an Aurora cluster with multiple nodes for high availability and scalability.

    Engine: MySQL or PostgreSQL compatible.
    Cluster Nodes: Configurable number of writer and reader instances.
    Replication: Aurora automatically handles replication across nodes.
    Performance: Designed for high throughput and low latency.

Use Case: Enterprise-grade applications with high availability and disaster recovery needs.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
