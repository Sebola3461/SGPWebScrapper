import commander from "commander";
import { SGPFetch } from "../core/SGPFetch";
import { SGPWeb } from "../../types/SGPWeb";
import { LoggerService } from "../utils/LoggerService";
import moment from "moment";

export class ARGVManager {
  public sgp: SGPFetch;
  public options = new commander.Command();
  private logger = new LoggerService("Parâmetros");
  private isUsingConfiguration = false;

  constructor(sgp: SGPFetch) {
    this.sgp = sgp;

    if (this.sgp.configuration.canUseSettingsFile()) {
      this.isUsingConfiguration = true;
      this.logger.printInfo("Utilizando modo estático");
    } else {
      this.defineCommands();
    }
  }

  public parseCommands() {
    this.options.parse(process.argv);
  }

  public getExportType() {
    const input = this.isUsingConfiguration
      ? this.sgp.configuration.outputFormat
      : this.options.opts().Formato;

    const sanitizedFormat = String(input).trim().toLowerCase();

    if (!["xls", "csv"].includes(sanitizedFormat))
      return "xls" as SGPWeb.SearchExportType;

    return sanitizedFormat as SGPWeb.SearchExportType;
  }

  private sanitizeStringInput(input: string) {
    return String(input).trim().toLowerCase();
  }

  public getOutputPath() {
    const input = this.isUsingConfiguration
      ? this.sgp.configuration.outputPath
      : this.options.opts().Path;

    if (!input) return `./export.${this.getExportType()}`;

    return this.sanitizeStringInput(input);
  }

  public getInitialDate() {
    const input = this.isUsingConfiguration
      ? this.sgp.configuration.initialDate
      : this.options.opts().Desde;

    const sanitizedInitialDate = this.sanitizeStringInput(input);

    const dateFields = sanitizedInitialDate.split("/");

    if (
      this.sgp.configuration.period != undefined &&
      this.sgp.configuration.initialDate != undefined
    ) {
      this.logger.printError(
        "Não é possível utilizar o período e a data inicial juntos!"
      );

      return this.getToday();
    }

    if (this.sgp.configuration.period) {
      const newDate = moment(new Date())
        .subtract(this.sgp.configuration.period, "days")
        .format("DD/MM/YYYY");

      return newDate;
    }

    if (
      dateFields.length != 3 ||
      dateFields
        .map((date) => Number(date))
        .filter((date) => !isNaN(Number(date))).length != 3
    ) {
      this.logger.printWarning(
        "A data final informada não está no formato correto, será utilizada a data de hoje. Deve ser utilizado o formato (dd/mm/aaaa)"
      );

      return this.getToday();
    }

    return sanitizedInitialDate;
  }

  private getToday() {
    return moment().format("DD/MM/YYYY");
  }

  public getEndDate() {
    const input = this.isUsingConfiguration
      ? this.sgp.configuration.outputFormat
      : this.options.opts().Ate;

    const sanitizedEndDate = this.sanitizeStringInput(input);

    const dateFields = sanitizedEndDate.split("/");

    if (
      dateFields.length != 3 ||
      dateFields
        .map((date) => Number(date))
        .filter((date) => !isNaN(Number(date))).length != 3
    ) {
      this.logger.printWarning(
        "A data final informada não está no formato correto, será utilizada a data de hoje. Deve ser utilizado o formato (dd/mm/aaaa)"
      );

      return this.getToday();
    }
    return sanitizedEndDate;
  }

  public getLoginCredentials() {
    const user = this.isUsingConfiguration
      ? this.sgp.configuration.username
      : this.options.opts().User;
    const senha = this.isUsingConfiguration
      ? this.sgp.configuration.senha
      : this.options.opts().Senha;

    if (!user || !senha)
      throw this.sgp.closeWithError(
        "Você deve passar as credenciais de login! Use -help para mais informações"
      );

    return {
      user,
      senha,
    };
  }

  private defineCommands() {
    this.options
      .option("-d, -desde <value>", "Data inicial da pesquisa (dd/mm/aaaa)")
      .option("-a, -ate <value>", "Data final da pesquisa (dd/mm/aaaa)")
      .option("-f, -formato <value>", "Formato de exportação (csv | xls)")
      .option("-p, -path <value>", "Caminho do resultado das pesquisas")
      .option("-u, -user <value>", "SGPWeb usuario de login")
      .option("-s, -senha <value>", "SGPWeb senha de login");
  }
}
