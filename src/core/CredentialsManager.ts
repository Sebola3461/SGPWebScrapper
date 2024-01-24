import axios from "axios";
import { SGPFetch } from "./SGPFetch";
import { LoggerService } from "../utils/LoggerService";

export class CredentialsManager {
  public sgp: SGPFetch;
  public sessionId: string = "";
  private logger = new LoggerService("CredentialsManager");

  constructor(sgp: SGPFetch) {
    this.sgp = sgp;
  }

  public createSession() {
    return new Promise((resolve, reject) => {
      this.logger.printInfo("Gerando novo sessionId...");

      axios("https://sgpweb.com.br/include/login.php", {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: `usuario=${
          this.sgp.parameters.getLoginCredentials().user
        }&senha=${this.sgp.parameters.getLoginCredentials().senha}`,
        method: "POST",
      }).then((response) => {
        try {
          if (
            response.status != 200 ||
            !response.headers["set-cookie"] ||
            response.data.includes("senha incorretos")
          ) {
            this.logger.printError(
              `Não foi possível gerar um novo sessionId`,
              response.data
            );

            throw this.sgp.closeWithError(
              "Não foi possível gerar um novo sessionId! Certifique-se de que as credenciais de login estão corretas"
            );
          }

          const URLEncodedCookies = new URLSearchParams(
            response.headers["set-cookie"][0]
          );
          const sessionId = URLEncodedCookies.get("PHPSESSID");

          if (sessionId) {
            const sanitizedSessionId = sessionId.split(";")[0].trim();
            this.sessionId = sanitizedSessionId;

            this.logger.printSuccess(
              `Novo sessionId gerado: ${this.sessionId}`
            );
            return resolve(this.sessionId);
          }
        } catch (e) {
          this.logger.printError(`Não foi possível gerar um novo sessionId`, e);

          reject(e);
        }
      });
    });
  }
}
