import State from "./dto";

const appState: State = {
  procPages: new Map(),
  procs: new Map(),
} as State;

const companies: string[] = [
  "nike do brasil comércio e participações ltda",
  "adidas do brasil ltda",
  "puma do brasil ltda",
  "reebok produtos esportivos ltda",
  "asics brasil, distribuição e comércio de artigos esportivos ltda",
  "under armour brasil comércio e distribuição de artigos esportivos ltda",
];

export default State;
export { appState, companies };
