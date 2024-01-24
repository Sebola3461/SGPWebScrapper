import axios from "axios";
import { SGPFetch } from "../core/SGPFetch";
import { LoggerService } from "../utils/LoggerService";
import querystring from "querystring";
import { SGPWeb } from "../../types/SGPWeb";
import { writeFileSync } from "fs";
import { ExportSearchCSVBody } from "../constants/fetch/ExportSearchCSVBody";
import { ExportSearchXLSBody } from "../constants/fetch/ExportSearchXLSBody";

interface SearchObject {
  data_inicio: string;
  data_fim: string;
  contrato: string;
  selectPrazo: string;
  selectTipo: string;
  ordenacao: string;
  limite: number;
  [key: string]: string | number;
}

export class SearchManager {
  public sgp: SGPFetch;
  private logger = new LoggerService("SearchManager");

  constructor(sgp: SGPFetch) {
    this.sgp = sgp;
  }

  /**
   * Isso vai dizer ao SGPWeb que iniciamos uma nova pesquisa
   * Privado pois não deve ser chamado fora deste objeto
   */
  private fakeSearchRequest() {
    return new Promise((resolve, reject) => {
      axios("https://sgpweb.com.br/forms/pesquisaCompleta.php", {
        headers: {
          cookie: `PHPSESSID=${this.sgp.credentials.sessionId}; key=value`,
        },
        method: "GET",
      }).then(() => resolve(true));
    });
  }

  public exportSearch(type: SGPWeb.SearchExportType, path: string) {
    return new Promise((resolve, reject) => {
      this.logger.printInfo("Exportando a última pesquisa...");

      axios("https://sgpweb.com.br/include/operador.php?acao=exportar", {
        headers: {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundaryrMoiJJWTR9888ZRM",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          cookie: `PHPSESSID=${this.sgp.credentials.sessionId}; key=value`,
        },
        data: (type == SGPWeb.SearchExportType.CSV
          ? ExportSearchCSVBody
          : ExportSearchXLSBody
        )
          .replace("{{data_inicio}}", this.sgp.parameters.getInitialDate())
          .replace("{{data_fim}}", this.sgp.parameters.getEndDate()),
        method: "POST",
      }).then((response) => {
        if (response.status != 200) {
          this.logger.printError(
            `Não foi possível exportar os dados da pesquisa: `,
            response.statusText
          );

          throw this.sgp.closeWithError(
            "Não foi possível exportar os dados da pesquisa!"
          );
        }

        this.logger.printSuccess("Pesquisa exportada!");

        writeFileSync(path, response.data);

        resolve(response.data);
      });
    });
  }

  public searchAll(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.printInfo("Processando nova pesquisa...");

      const search = new URLSearchParams();

      const searchObject = {
        data_inicio: this.sgp.parameters.getInitialDate(),
        data_fim: this.sgp.parameters.getEndDate(),
        contrato: "indiferente",
        selectPrazo: "indiferente",
        selectTipo: "todos",
        ordenacao: "data_desc",
        limite: 15,
      } as SearchObject;

      for (const field of Object.keys(searchObject)) {
        if (searchObject[field])
          search.set(field, searchObject[field].toString());
      }

      this.fakeSearchRequest().then(() => {
        axios(
          "https://sgpweb.com.br/include/pesquisar.php?tabela=objetos&busca=postagens",
          {
            headers: {
              accept: "text/html, */*; q=0.01",
              "accept-language": "en-US,en;q=0.9,pt;q=0.8",
              "content-type": "application/x-www-form-urlencoded",
              cookie: `PHPSESSID=${this.sgp.credentials.sessionId}; key=value`,
            },
            data: querystring.encode(searchObject),
            method: "POST",
          }
        ).then((response) => {
          if (response.status != 200) {
            this.logger.printError(
              `Não foi possível processar a pesquisa`,
              response.data
            );

            throw this.sgp.closeWithError(
              "Não foi possível concluir a pesquisa!"
            );
          }

          this.logger.printSuccess("Nova pesquisa concluída");
          resolve(true);
        });
      });
    });
  }
}
