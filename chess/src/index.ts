import { Playground } from "@stackr/sdk/plugins";
import { play } from "./cli.ts";
import { mru } from "./stackr/mru.ts";
import { sleep } from "./utils.ts";

const main = async () => {
  if (process.env.NODE_ENV !== "production") {
    Playground.init(mru);
    await sleep(1000);
  }

  await play();
};

main();
