import {
  packages,
  forPlatform,
  getHostPlatform,
  installTo
} from "https://deno.land/x/adllang_localsetup@v0.7/mod.ts";

const DENO = packages.deno("1.34.1");
const NODE = packages.nodejs("18.16.0");
const YARN = packages.yarn("1.22.19");
const FOUNDRY = packages.foundry("nightly-d369d2486f85576eec4ca41d277391dfdae21ba7"); // 2023-07-02

export async function main() {
  if (Deno.args.length != 1) {
    console.error("Usage: local-setup LOCALDIR");
    Deno.exit(1);
  }
  const localdir = Deno.args[0];

  const platform = getHostPlatform();

  const installs = [
    forPlatform(DENO, platform),
    forPlatform(NODE, platform),
    forPlatform(FOUNDRY, platform),
    YARN,
  ];

  await installTo(installs, localdir);
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });
