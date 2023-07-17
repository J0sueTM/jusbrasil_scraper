import * as fs from "fs";
import Middleware from "../middlewares/middleware";

class Spider {
  protected baseUrl: string;
  protected urls: string[] = [];

  protected name: string;
  protected cacheFilePath: string;

  protected middlewares: Middleware[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async crawl() {
    throw new Error("FIXME: crawl() não foi implementada");
  }

  protected saveCompany(company: string, data: any[]) {
    throw new Error("FIXME: saveCompany() não foi implementada");
  }

  protected save() {
    throw new Error("FIXME: save() não foi implementada");
  }

  protected load() {
    throw new Error("FIXME: load() não foi implementada");
  }

  protected shouldLoad(): boolean {
    return fs.existsSync(this.cacheFilePath);
  }

  public async run(name: string) {
    this.name = name;
    this.cacheFilePath = `cache/${this.name.replaceAll(" ", "-")}.json`;

    console.info(`Spider >> ${this.name} << inicializada`);

    try {
      console.info("Verificando cache...");
      if (this.shouldLoad()) {
        console.info("Cachê encontrado, extraindo...");

        this.load();
      } else {
        console.info("Cachê não encontrado, extraindo...");
        await this.crawl();

        console.info("Salvando cachê");
        this.save();
      }
    } catch (err: any) {
      console.error(err);
    }

    if (this.middlewares.length >= 1) {
      console.info("Executando middlewares...");
      for (const middleware of this.middlewares) {
        middleware.run();
      }

      console.info("Salvando cachê dos middlewares...");
      this.save();
    }

    console.info(`Spider >> ${this.name} << finalizada\n`);
  }
}

export default Spider;
