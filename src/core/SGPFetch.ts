import { SearchManager } from "../fetch/SearchManager";
import { ARGVManager } from "../terminal/ARGVManager";
import { ConfigurationManager } from "./ConfigurationManager";
import { CredentialsManager } from "./CredentialsManager";

export class SGPFetch {
  public configuration = new ConfigurationManager(this);
  public credentials = new CredentialsManager(this);
  public search = new SearchManager(this);
  public parameters = new ARGVManager(this);

  constructor() {
    this.parameters.parseCommands();
  }

  public initialize() {
    this.credentials.createSession().then(async () => {
      await this.search.searchAll();
      await this.search.exportSearch(
        this.parameters.getExportType(),
        this.parameters.getOutputPath()
      );

      process.exit(0);
    });
  }

  public closeWithError(error: string) {
    console.error(error);
    process.exit(1);
  }
}
