import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import ini from "ini";
import { SGPFetch } from "./SGPFetch";
import { LoggerService } from "../utils/LoggerService";

interface ConfigurationFile {
  Geral: {
    username?: string;
    senha?: string;
    data_inicio?: string;
    data_final?: string;
    path?: string;
    formato?: string;
    period?: number;
  };
}

export class ConfigurationManager {
  public username: string | undefined;
  public senha: string | undefined;
  public initialDate: string | undefined;
  public endDate: string | undefined;
  public outputPath: string | undefined;
  public outputFormat: "xlsx" | "csv" = "xlsx";
  public period: number | undefined;
  public sgp: SGPFetch;
  private logger = new LoggerService("Configuração");

  constructor(sgp: SGPFetch) {
    this.sgp = sgp;

    if (this.canUseSettingsFile()) this.parseConfiguration();
  }

  public canUseSettingsFile() {
    return existsSync(resolve(`./sgpconfig.ini`));
  }

  private parseConfiguration() {
    const configFile = readFileSync(resolve(`./sgpconfig.ini`), "utf8");

    const parsedConfig = ini.parse(configFile);

    if (!parsedConfig || !parsedConfig.Geral) return;

    const config = parsedConfig as ConfigurationFile;

    if (config.Geral.username) this.username = config.Geral.username;
    if (config.Geral.senha) this.senha = config.Geral.senha;
    if (config.Geral.data_inicio) this.initialDate = config.Geral.data_inicio;
    if (config.Geral.data_final) this.endDate = config.Geral.data_final;
    if (config.Geral.path) this.outputPath = config.Geral.path;
    if (config.Geral.period && !isNaN(config.Geral.period)) {
      this.logger.printInfo(
        `Utilizando um período de ${config.Geral.period} dia(s)`
      );

      this.period = Number(config.Geral.period);
    }
    if (
      config.Geral.formato &&
      (config.Geral.formato == "xlsx" || config.Geral.formato == "csv")
    ) {
      this.outputFormat = config.Geral.formato;
    }
  }
}
