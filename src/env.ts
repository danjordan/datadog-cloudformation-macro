import { FunctionInfo } from "layer";

export interface Configuration {
  // Whether to add the lambda layers, or expect the user's to bring their own
  addLayers: boolean;
  // Datadog API Key, only necessary when using metrics without log forwarding
  apiKey?: string;
  // Datadog API Key encrypted using KMS, only necessary when using metrics without log forwarding
  apiKMSKey?: string;
  // Which Site to send to, (should be datadoghq.com or datadoghq.eu)
  site: string;
  // The log level, (set to DEBUG for extended logging)
  logLevel: string;
  // Whether the log forwarder integration is enabled by default
  flushMetricsToLogs: boolean;
  // Enable tracing on Lambda functions and API Gateway integrations using X-Ray. Defaults to true
  enableXrayTracing: boolean;
  // Enable tracing on Lambda function using dd-trace, datadog's APM library.
  enableDDTracing: boolean;
  // When set, the plugin will subscribe the lambdas to the forwarder with the given arn.
  forwarder?: string;
}

const apiKeyEnvVar = "DD_API_KEY";
const apiKeyKMSEnvVar = "DD_KMS_API_KEY";
const siteURLEnvVar = "DD_SITE";
const logLevelEnvVar = "DD_LOG_LEVEL";
const logForwardingEnvVar = "DD_FLUSH_TO_LOG";
const DATADOG = "datadog";

export const defaultConfiguration: Configuration = {
  addLayers: true,
  flushMetricsToLogs: true,
  logLevel: "info",
  site: "datadoghq.com",
  enableXrayTracing: true,
  enableDDTracing: true,
};

export function getConfig(mappings: any): Configuration {
  if (mappings === undefined) {
    return defaultConfiguration;
  }
  let datadogConfig = mappings[DATADOG] as Partial<Configuration> | undefined;
  if (datadogConfig === undefined) {
    datadogConfig = {};
  }
  return {
    ...defaultConfiguration,
    ...datadogConfig,
  };
}

export function setEnvConfiguration(
  config: Configuration,
  funcs: FunctionInfo[]
) {
  funcs.forEach((func) => {
    const environment = func.lambda.Environment ?? {};
    const envVariables = environment.Variables ?? {};

    if (
      config.apiKey !== undefined &&
      envVariables[apiKeyEnvVar] === undefined
    ) {
      envVariables[apiKeyEnvVar] = config.apiKey;
    }
    if (
      config.apiKey !== undefined &&
      envVariables[apiKeyEnvVar] === undefined
    ) {
      envVariables[apiKeyEnvVar] = config.apiKey;
    }
    if (
      config.apiKMSKey !== undefined &&
      envVariables[apiKeyKMSEnvVar] === undefined
    ) {
      envVariables[apiKeyKMSEnvVar] = config.apiKMSKey;
    }
    if (envVariables[siteURLEnvVar] === undefined) {
      envVariables[siteURLEnvVar] = config.site;
    }
    if (envVariables[logLevelEnvVar] === undefined) {
      envVariables[logLevelEnvVar] = config.logLevel;
    }
    if (envVariables[logForwardingEnvVar] === undefined) {
      envVariables[logForwardingEnvVar] = config.flushMetricsToLogs;
    }

    environment.Variables = envVariables;
    func.lambda.Environment = environment;
  });
}
